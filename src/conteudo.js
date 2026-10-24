// Lotecando – Loterias Caixa
// Sem garantia. Uso por conta e risco do usuário; o autor não se responsabiliza pelos efeitos do uso.
// Projeto não oficial, sem vínculo com a Caixa Econômica Federal. Veja o README.md e a licença MIT.
//
// Script injetado na aba da Loteca ou da Mega-Sena do site de Loterias Online da Caixa. Preenche um jogo por vez e o
// coloca no carrinho. NUNCA vai para o pagamento: o usuário confere o carrinho e paga por conta própria.
// O laço roda aqui (não no popup) para continuar mesmo que o popup seja fechado.
// Seletores e comportamento do site: docs/site-caixa-loteca.md e docs/site-caixa-mega-sena.md. Se a Caixa mudar a
// página, ajuste só SELETORES e MODALIDADES.

(() => {
  if (window.lotecando) return;

  const SELETORES = {
    limpar: '#limparvolante',
    carrinho: '#colocarnocarrinho',
    modais: '.modal',
    fecharModal: '.data-fechar-modal-alerta, #fecharModalAlerta, .data-fechar-modal-confirmacao, button.close', // "Fechar"
    cancelarConfirmacao: '.data-cancelar-modal-confirmacao', // "Cancelar" das perguntas do site (ex.: aposta idêntica)
    contadorDoCarrinho: '#carrinho', // número de jogos no carrinho, no cabeçalho do site
  };
  const LIMITE_DE_RECUSAS_SEGUIDAS = 5;

  // Cada modalidade diz como achar o que está marcado na tela e como marcar um jogo. "marcas" vêm do popup:
  // Loteca = índices em a.loteca_palpite (jogo * 3 + coluna); Mega-Sena = ids das dezenas ("n01"... "n60"), em ordem.
  const MODALIDADES = {
    loteca: {
      nome: 'Loteca',
      seletorDoValor: '.valor-aposta',
      telaPronta: () => document.querySelectorAll('a.loteca_palpite').length === 42, // 14 jogos x 3 colunas
      marcados: () =>
        [...document.querySelectorAll('a.loteca_palpite')].flatMap((a, indice) =>
          a.classList.contains('loteca_palpite_selecionado') && !a.classList.contains('loteca_palpite_selecionado-remove')
            ? [indice]
            : []
        ),
      marca: (jogo) => {
        const todos = document.querySelectorAll('a.loteca_palpite');
        jogo.marcas.forEach((indice) => todos[indice].click());
      },
    },
    mega: {
      nome: 'Mega-Sena',
      seletorDoValor: '#valoraposta',
      telaPronta: () => Boolean(document.getElementById('n01') && document.getElementById('n60')),
      marcados: () =>
        [...document.querySelectorAll('a.selected')].map((a) => a.id).filter((id) => /^n\d\d$/.test(id)).sort(),
      // Acima de 6 dezenas o site só deixa marcar depois de aumentar a quantidade de números (uma vez por dezena extra).
      preparar: (jogo) => {
        for (let i = 0; i < jogo.aumentos; i++) document.getElementById('aumentarnumero')?.click();
      },
      marca: (jogo) => jogo.marcas.forEach((id) => document.getElementById(id)?.click()),
    },
  };

  const estado = {
    rodando: false,
    cancelar: false,
    modalidade: null,
    total: 0,
    feitos: 0,
    atual: null, // numero da linha do arquivo em andamento
    erro: null, // {numero, mensagem}
    concluido: false,
    centavosPorAposta: null,
    itensAntes: null, // itens que já estavam no carrinho ao começar
    recusados: [], // [{numero, mensagem}] jogos que o site não aceitou
  };

  // O Chrome atrasa os setTimeout de abas ocultas (1 s, e bem mais depois de 5 min). Por isso as esperas aqui são
  // guiadas por mudanças na página (MutationObserver) e por MessageChannel, que não sofrem esse atraso; o setTimeout
  // só serve de limite de segurança.
  const cede = () =>
    new Promise((resolve) => {
      const canal = new MessageChannel();
      canal.port1.onmessage = () => {
        canal.port1.close();
        resolve();
      };
      canal.port2.postMessage(0);
    });

  function esperaAte(condicao, limiteMs = 5000) {
    return new Promise((resolve) => {
      if (condicao()) return resolve(true);

      const observador = new MutationObserver(() => {
        if (condicao()) termina(true);
      });
      const limite = setTimeout(() => termina(condicao()), limiteMs);
      let terminou = false;

      function termina(resultado) {
        if (terminou) return;
        terminou = true;
        observador.disconnect();
        clearTimeout(limite);
        resolve(resultado);
      }

      observador.observe(document.documentElement, { attributes: true, childList: true, subtree: true, characterData: true });
    });
  }

  const mesmosItens = (a, b) => a.length === b.length && a.every((valor, i) => valor === b[i]);

  function modalAberto() {
    return [...document.querySelectorAll(SELETORES.modais)].find((m) => getComputedStyle(m).display !== 'none');
  }

  // Mensagem do site ("× Loteria Online <texto> Fechar" -> "<texto>"). Pergunta de aposta idêntica vira uma frase direta.
  function textoDoModal(modal) {
    const texto = modal.innerText
      .replace(/\s+/g, ' ')
      .replace(/^[×x]\s*/i, '')
      .replace(/^Loterias? Online\s*/i, '')
      .replace(/\s*(Fechar|Confirmar Cancelar)$/i, '')
      .trim();
    return /id[eê]ntica/i.test(texto) ? 'o carrinho já tem uma aposta idêntica (não repeti)' : texto;
  }

  // Fecha o aviso. Em perguntas do site (Confirmar/Cancelar) responde Cancelar: a extensão nunca confirma por conta própria.
  async function fechaModal(modal) {
    (modal.querySelector(SELETORES.cancelarConfirmacao) ?? modal.querySelector(SELETORES.fecharModal))?.click();
    if (!(await esperaAte(() => !modalAberto(), 4000))) {
      throw new Error('Não consegui fechar o aviso do site.');
    }
  }

  // Jogo que o site não aceita; não impede os outros.
  class RecusadoPeloSite extends Error {}

  function itensNoCarrinho() {
    const numero = parseInt(document.querySelector(SELETORES.contadorDoCarrinho)?.innerText, 10);
    return Number.isNaN(numero) ? null : numero;
  }

  const emReais = (centavos) => `R$ ${(centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  // "Valor da Aposta: R$ 4,00" -> 400
  function valorEmCentavos(modalidade) {
    const texto = document.querySelector(modalidade.seletorDoValor)?.innerText ?? '';
    const m = texto.match(/R\$\s*([\d.]+),(\d{2})/);
    return m ? Number(m[1].replace(/\./g, '')) * 100 + Number(m[2]) : null;
  }

  async function limpaVolante(modalidade) {
    document.querySelector(SELETORES.limpar)?.click();
    if (!(await esperaAte(() => modalidade.marcados().length === 0))) {
      throw new Error('Não consegui limpar o volante do site.');
    }
  }

  async function preencheJogo(modalidade, jogo) {
    if (!modalidade.telaPronta()) {
      throw new Error(`Tela da ${modalidade.nome} não encontrada. Abra a página da ${modalidade.nome} no site da Caixa.`);
    }

    await limpaVolante(modalidade);

    modalidade.preparar?.(jogo);
    modalidade.marca(jogo);

    if (!(await esperaAte(() => mesmosItens(modalidade.marcados(), jogo.marcas)))) {
      const obtidas = modalidade.marcados().length;
      const aviso = modalAberto();
      if (aviso) {
        // O site avisou algo que vale para qualquer jogo (ex.: concurso fechado ou ainda não aberto): para tudo e repassa.
        const mensagem = textoDoModal(aviso);
        await fechaModal(aviso);
        throw new Error(`O site avisou: "${mensagem}"`);
      }
      await limpaVolante(modalidade);
      throw new Error(`O jogo no site ficou diferente do arquivo (${obtidas} marcas em vez de ${jogo.marcas.length}).`);
    }

    // Confere o valor mostrado pelo site. O preço por aposta só é aprendido de um jogo que o site aceitou de fato
    // (mais abaixo); até lá, quem valida é o próprio site. Depois, o valor tem de bater com o esperado.
    if (estado.centavosPorAposta !== null) {
      await esperaAte(() => valorEmCentavos(modalidade) === estado.centavosPorAposta * jogo.apostas, 3000);
    } else {
      for (let i = 0; i < 5; i++) await cede(); // deixa o site atualizar o valor
    }
    const centavos = valorEmCentavos(modalidade);
    if (centavos !== null && estado.centavosPorAposta !== null && centavos !== estado.centavosPorAposta * jogo.apostas) {
      await limpaVolante(modalidade);
      // Não vai ao carrinho: o jogo do site não corresponde ao do arquivo (ex.: combinação que o site não aceita).
      throw new RecusadoPeloSite(
        `o valor no site (${emReais(centavos)}) não bate com o esperado (${emReais(estado.centavosPorAposta * jogo.apostas)}, ` +
        `${jogo.apostas} aposta(s)); o site não aceita essa combinação`
      );
    }

    // O contador do carrinho é quem diz se o jogo entrou: ele precisa passar de "já confirmados" para "mais um".
    const esperado = estado.itensAntes === null ? null : estado.itensAntes + estado.feitos + 1;
    const entrou = () => esperado !== null && itensNoCarrinho() === esperado;

    document.querySelector(SELETORES.carrinho)?.click();

    // O site limpa o volante sozinho quando aceita a aposta; se aparecer um modal, é uma mensagem de erro/aviso.
    const resolvido = await esperaAte(() => modalidade.marcados().length === 0 || modalAberto(), 8000);
    const modal = modalAberto();
    if (modal) {
      // Antes de dar o jogo por recusado, dá um instante ao contador: o aviso pode não ter relação com este jogo.
      if (esperado !== null) await esperaAte(entrou, 1500);
      const mensagem = textoDoModal(modal);
      await fechaModal(modal);
      if (!entrou()) {
        // O site recusou este jogo. Limpa e deixa o laço seguir para o próximo.
        await limpaVolante(modalidade);
        throw new RecusadoPeloSite(mensagem);
      }
    } else if (!resolvido && !entrou()) {
      // Sem aviso e sem entrar no carrinho: limpa e segue para o próximo.
      await limpaVolante(modalidade);
      throw new RecusadoPeloSite('o site não aceitou o jogo e não deu nenhuma mensagem');
    }

    // O jogo só conta como feito quando o contador do carrinho do site sobe.
    if (esperado !== null && !(await esperaAte(entrou, 8000))) {
      throw new Error(
        `O site não confirmou o jogo: o carrinho mostra ${itensNoCarrinho() ?? 'um valor ilegível'} item(ns) ` +
        `e eram esperados ${esperado}.`
      );
    }

    // Jogo aceito: aprende o preço por aposta para conferir os próximos.
    if (estado.centavosPorAposta === null && centavos !== null && centavos % jogo.apostas === 0) {
      estado.centavosPorAposta = centavos / jogo.apostas;
    }
  }

  async function iniciar(jogos, nomeDaModalidade = 'loteca') {
    if (estado.rodando) return;
    const modalidade = MODALIDADES[nomeDaModalidade];
    Object.assign(estado, {
      rodando: true,
      cancelar: false,
      modalidade: nomeDaModalidade,
      total: jogos.length,
      feitos: 0,
      atual: null,
      erro: null,
      concluido: false,
      itensAntes: itensNoCarrinho(),
      recusados: [],
      centavosPorAposta: null,
    });

    let recusasSeguidas = 0;
    try {
      if (!modalidade) throw new Error(`Modalidade desconhecida: ${nomeDaModalidade}.`);

      // Um aviso do site já aberto (ex.: concurso fechado ou ainda não aberto) atrapalha tudo: avisa antes de mexer em algo.
      const avisoAberto = modalAberto();
      if (avisoAberto) throw new Error(`O site está com um aviso aberto: "${textoDoModal(avisoAberto)}". Feche-o e tente de novo.`);

      for (const jogo of jogos) {
        if (estado.cancelar) break;
        estado.atual = jogo.numero;
        try {
          await preencheJogo(modalidade, jogo);
          estado.feitos++;
          recusasSeguidas = 0;
        } catch (erro) {
          if (!(erro instanceof RecusadoPeloSite)) throw erro;
          estado.recusados.push({ numero: jogo.numero, mensagem: erro.message });
          if (++recusasSeguidas >= LIMITE_DE_RECUSAS_SEGUIDAS) {
            throw new Error(`O site recusou ${recusasSeguidas} jogos seguidos; parei para você conferir a página e o arquivo.`);
          }
        }
        estado.atual = null;
        await cede();
      }
      estado.concluido = !estado.cancelar;
    } catch (erro) {
      estado.erro = { numero: estado.atual, mensagem: erro.message };
    } finally {
      estado.rodando = false;
    }
  }

  window.lotecando = {
    iniciar,
    cancelar: () => {
      estado.cancelar = true;
    },
    estado: () => ({ ...estado }),
  };
})();
