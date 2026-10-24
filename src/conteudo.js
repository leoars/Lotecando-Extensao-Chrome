// Lotecando – Loterias Caixa
// Sem garantia. Uso por conta e risco do usuário; o autor não se responsabiliza pelos efeitos do uso.
// Projeto não oficial, sem vínculo com a Caixa Econômica Federal. Veja o README.md e a licença MIT.
//
// Script injetado na aba da Loteca do site de Loterias Online da Caixa. Preenche um volante por vez e o coloca no
// carrinho. NUNCA vai para o pagamento: o usuário confere o carrinho e paga por conta própria.
// O laço roda aqui (não no popup) para continuar mesmo que o popup seja fechado.
// Seletores e comportamento do site: docs/site-caixa-loteca.md. Se a Caixa mudar a página, ajuste só SELETORES.

(() => {
  if (window.lotecando) return;

  const SELETORES = {
    palpites: 'a.loteca_palpite',
    classeMarcado: 'loteca_palpite_selecionado',
    classeSaindo: 'loteca_palpite_selecionado-remove',
    limpar: '#limparvolante',
    carrinho: '#colocarnocarrinho',
    valor: '.valor-aposta',
    modais: '.modal',
  };
  const TOTAL_DE_PALPITES = 42; // 14 jogos x 3 colunas
  const PAUSA_ENTRE_VOLANTES_MS = 400;

  const estado = {
    rodando: false,
    cancelar: false,
    total: 0,
    feitos: 0,
    atual: null, // numero da linha do .vol em andamento
    erro: null, // {numero, mensagem}
    concluido: false,
    centavosPorAposta: null,
  };

  const espera = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function esperaAte(condicao, limiteMs = 5000) {
    const inicio = Date.now();
    while (Date.now() - inicio < limiteMs) {
      if (condicao()) return true;
      await espera(60);
    }
    return condicao();
  }

  const palpites = () => [...document.querySelectorAll(SELETORES.palpites)];

  function indicesMarcados() {
    const marcados = [];
    palpites().forEach((a, indice) => {
      if (a.classList.contains(SELETORES.classeMarcado) && !a.classList.contains(SELETORES.classeSaindo)) {
        marcados.push(indice);
      }
    });
    return marcados;
  }

  const mesmosIndices = (a, b) => a.length === b.length && a.every((valor, i) => valor === b[i]);

  function modalAberto() {
    return [...document.querySelectorAll(SELETORES.modais)].find((m) => getComputedStyle(m).display !== 'none');
  }

  // "Valor da Aposta: R$ 4,00" -> 400
  function valorEmCentavos() {
    const texto = document.querySelector(SELETORES.valor)?.innerText ?? '';
    const m = texto.match(/R\$\s*([\d.]+),(\d{2})/);
    return m ? Number(m[1].replace(/\./g, '')) * 100 + Number(m[2]) : null;
  }

  async function limpaVolante() {
    document.querySelector(SELETORES.limpar)?.click();
    if (!(await esperaAte(() => indicesMarcados().length === 0))) {
      throw new Error('Não consegui limpar o volante do site.');
    }
  }

  async function preencheVolante(volante) {
    if (palpites().length !== TOTAL_DE_PALPITES) {
      throw new Error('Tela da Loteca não encontrada. Abra a página da Loteca no site da Caixa.');
    }

    await limpaVolante();

    const todos = palpites();
    volante.marcas.forEach((indice) => todos[indice].click());

    if (!(await esperaAte(() => mesmosIndices(indicesMarcados(), volante.marcas)))) {
      const obtidas = indicesMarcados().length;
      await limpaVolante();
      throw new Error(`O volante no site ficou diferente do arquivo (${obtidas} marcas em vez de ${volante.marcas.length}).`);
    }

    // Confere o valor mostrado pelo site: o primeiro volante define o preço por aposta; os demais têm de bater.
    await espera(300);
    const centavos = valorEmCentavos();
    if (centavos !== null) {
      if (estado.centavosPorAposta === null && centavos % volante.apostas === 0) {
        estado.centavosPorAposta = centavos / volante.apostas;
      }
      if (estado.centavosPorAposta !== null && centavos !== estado.centavosPorAposta * volante.apostas) {
        await limpaVolante();
        throw new Error(
          `O valor mostrado pelo site (${centavos / 100} reais) não bate com ${volante.apostas} aposta(s) a ` +
          `${estado.centavosPorAposta / 100} reais cada.`
        );
      }
    }

    document.querySelector(SELETORES.carrinho)?.click();

    // O site limpa o volante sozinho quando aceita a aposta; se aparecer um modal, é uma mensagem de erro/aviso.
    const resolvido = await esperaAte(() => indicesMarcados().length === 0 || modalAberto(), 8000);
    const modal = modalAberto();
    if (modal) {
      throw new Error(`O site mostrou uma mensagem: "${modal.innerText.replace(/\s+/g, ' ').trim().slice(0, 200)}"`);
    }
    if (!resolvido) {
      throw new Error('O site não colocou a aposta no carrinho (o volante continuou marcado).');
    }
  }

  async function iniciar(volantes) {
    if (estado.rodando) return;
    Object.assign(estado, {
      rodando: true,
      cancelar: false,
      total: volantes.length,
      feitos: 0,
      atual: null,
      erro: null,
      concluido: false,
    });

    try {
      for (const volante of volantes) {
        if (estado.cancelar) break;
        estado.atual = volante.numero;
        await preencheVolante(volante);
        estado.feitos++;
        estado.atual = null;
        await espera(PAUSA_ENTRE_VOLANTES_MS);
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
