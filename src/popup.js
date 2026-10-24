// Lotecando – Loterias Caixa
// Sem garantia. Uso por conta e risco do usuário; o autor não se responsabiliza pelos efeitos do uso.
// Projeto não oficial, sem vínculo com a Caixa Econômica Federal. Veja o README.md e a licença MIT.

import { leVol, totalDeApostas, foraDoLimite, semDuploOuTriplo, acimaDoLimite, MAXIMO_DE_APOSTAS } from './vol.js';
import { leJogos } from './mega.js';

const SITE_DA_CAIXA = /^https:\/\/www\.loteriasonline\.caixa\.gov\.br\/silce-web\//;
const VERSAO_DO_AVISO = 1; // aumentar quando o aviso legal mudar, para pedir novo aceite

// O que muda de uma modalidade para outra: página, termo usado nas mensagens, leitura do arquivo e resumo.
const MODALIDADES = {
  loteca: {
    nome: 'Loteca',
    termo: 'volante(s)',
    pagina: /#\/loteca/,
    leArquivo: (texto) => leVol(texto),
    ignorado: foraDoLimite,
    dicaDeLinhaInvalida: 'Cada linha deve ter 14 dígitos de 1 a 7.',
    arquivoInvalido: 'Nenhum volante válido neste arquivo. Ele é mesmo um .vol da Loteca?',
    resumo: (todos, aceitaveis) =>
      `${todos.length} volante(s) no arquivo; ${aceitaveis.length} serão preenchidos, ` +
      `${totalDeApostas(aceitaveis)} aposta(s) no total (primeira linha: ${todos[0].linha}).` +
      (todos.filter(semDuploOuTriplo).length > 0
        ? ` Ignorados por não ter nenhum duplo ou triplo (a Loteca exige ao menos um): ${todos.filter(semDuploOuTriplo).length}.`
        : '') +
      (todos.filter(acimaDoLimite).length > 0
        ? ` Ignorados por passar de ${MAXIMO_DE_APOSTAS} apostas (limite da Loteca): ${todos.filter(acimaDoLimite).length}.`
        : ''),
  },
  mega: {
    nome: 'Mega-Sena',
    termo: 'jogo(s)',
    pagina: /#\/mega-sena/,
    leArquivo: (texto) => leJogos(texto),
    ignorado: () => false,
    dicaDeLinhaInvalida: 'Cada linha deve ter de 6 a 20 dezenas de dois dígitos (01 a 60), sem repetir.',
    arquivoInvalido: 'Nenhum jogo válido neste arquivo. Ele é mesmo um .txt da Mega-Sena (uma linha por jogo)?',
    resumo: (todos, aceitaveis, repetidas) =>
      `${todos.length} jogo(s) no arquivo, ${totalDeApostas(aceitaveis)} aposta(s) no total ` +
      `(primeira linha: ${todos[0].linha}).` +
      (repetidas.length > 0
        ? ` Atenção: ${repetidas.length} linha(s) repetida(s); se o carrinho já tiver o jogo idêntico, o site pergunta e a extensão responde Cancelar.`
        : ''),
  },
};

const $ = (id) => document.getElementById(id);

let volantes = [];
let repetidas = [];
let textoDoArquivo = null;
let modalidadeDoArquivo = null;
let consulta = null;

// tipo: 'ok' (aviso bom), 'erro' (aviso ruim) ou '' (aviso neutro); texto vazio esconde a tarja.
function mostraMensagem(texto, tipo = '') {
  const mensagem = $('mensagem');
  mensagem.textContent = texto;
  mensagem.className = { ok: 'aviso bom', erro: 'aviso ruim' }[tipo] ?? 'aviso';
  mensagem.hidden = texto === '';
}

async function abaAtiva() {
  const [aba] = await chrome.tabs.query({ active: true, currentWindow: true });
  return aba;
}

// Aba ativa do site da Caixa, numa modalidade que a extensão conhece: {aba, chave} ou null.
async function abaDaCaixa() {
  const aba = await abaAtiva();
  if (!aba || !SITE_DA_CAIXA.test(aba.url ?? '')) return null;
  const chave = Object.keys(MODALIDADES).find((k) => MODALIDADES[k].pagina.test(aba.url));
  return chave ? { aba, chave } : null;
}

// ---- Aviso legal e aceite ---------------------------------------------------------------------------------------

async function aceiteFeito() {
  try {
    const { avisoAceito } = await chrome.storage.local.get('avisoAceito');
    return avisoAceito === VERSAO_DO_AVISO;
  } catch {
    return false;
  }
}

$('aceito').addEventListener('change', () => {
  $('botaoAceitar').disabled = !$('aceito').checked;
});

$('botaoAceitar').addEventListener('click', async () => {
  try {
    await chrome.storage.local.set({ avisoAceito: VERSAO_DO_AVISO });
  } catch {
    // sem armazenamento: o aviso será mostrado de novo na próxima abertura
  }
  $('aviso').hidden = true;
  $('principal').hidden = false;
  iniciaPrincipal();
});

// ---- Arquivo ----------------------------------------------------------------------------------------------------

// Lê o texto do arquivo conforme a modalidade da página e mostra o resumo. Devolve false se nada serve.
function carregaArquivo(chave) {
  const modalidade = MODALIDADES[chave];
  const lido = modalidade.leArquivo(textoDoArquivo);
  volantes = lido.volantes;
  repetidas = lido.repetidas ?? [];
  modalidadeDoArquivo = chave;

  const invalidasEl = $('invalidas');
  if (lido.invalidas.length > 0) {
    const exemplo = lido.invalidas.slice(0, 5).map((i) => `linha ${i.numero}`).join(', ');
    invalidasEl.textContent =
      `${lido.invalidas.length} linha(s) inválida(s) ignorada(s) (${exemplo}${lido.invalidas.length > 5 ? '…' : ''}). ` +
      modalidade.dicaDeLinhaInvalida;
    invalidasEl.hidden = false;
  } else {
    invalidasEl.hidden = true;
  }

  if (volantes.length === 0) {
    $('resumo').hidden = true;
    mostraMensagem(modalidade.arquivoInvalido, 'erro');
    return false;
  }

  const aceitaveis = volantes.filter((volante) => !modalidade.ignorado(volante));
  $('resumoTexto').textContent = modalidade.resumo(volantes, aceitaveis, repetidas);
  $('inicio').value = '1';
  $('resumo').hidden = false;
  return true;
}

$('arquivo').addEventListener('change', async (evento) => {
  const arquivo = evento.target.files[0];
  $('resumo').hidden = true;
  mostraMensagem('');
  volantes = [];
  textoDoArquivo = null;
  modalidadeDoArquivo = null;
  if (!arquivo) return;

  textoDoArquivo = await arquivo.text();

  // Sem uma página da Caixa à vista, não dá para saber a modalidade: o arquivo só é lido ao iniciar.
  const atual = await abaDaCaixa();
  if (!atual) {
    mostraMensagem('Arquivo escolhido. Abra a página da Loteca ou da Mega-Sena no site da Caixa e escolha de novo.', 'erro');
    return;
  }
  carregaArquivo(atual.chave);
});

// ---- Execução ---------------------------------------------------------------------------------------------------

async function injeta(aba) {
  await chrome.scripting.executeScript({ target: { tabId: aba.id }, files: ['src/conteudo.js'] });
}

$('botaoIniciar').addEventListener('click', async () => {
  const atual = await abaDaCaixa();
  if (!atual) {
    mostraMensagem('Abra a página da Loteca ou da Mega-Sena no site de Loterias Online da Caixa e tente de novo.', 'erro');
    return;
  }
  const { aba, chave } = atual;
  const modalidade = MODALIDADES[chave];

  // O arquivo foi lido para outra modalidade (mudou de página depois): lê de novo para esta.
  if (modalidadeDoArquivo !== chave && !carregaArquivo(chave)) return;

  const inicio = Math.min(Math.max(parseInt($('inicio').value, 10) || 1, 1), volantes.length);
  const fila = volantes.slice(inicio - 1).filter((volante) => !modalidade.ignorado(volante));
  if (fila.length === 0) {
    mostraMensagem(`Não há ${modalidade.termo} para preencher a partir daí.`, 'erro');
    return;
  }

  try {
    await injeta(aba);
    await chrome.scripting.executeScript({
      target: { tabId: aba.id },
      func: (lista, nomeDaModalidade) => {
        window.lotecando.iniciar(lista, nomeDaModalidade);
        return true;
      },
      args: [fila, chave],
    });
  } catch (erro) {
    mostraMensagem(`Não consegui acessar a página: ${erro.message}`, 'erro');
    return;
  }

  mostraMensagem('');
  acompanha(aba);
});

$('botaoCancelar').addEventListener('click', async () => {
  const atual = await abaDaCaixa();
  if (!atual) return;
  await chrome.scripting.executeScript({
    target: { tabId: atual.aba.id },
    func: () => window.lotecando?.cancelar(),
  });
  $('botaoCancelar').disabled = true;
});

async function lerEstado(aba) {
  const [resultado] = await chrome.scripting.executeScript({
    target: { tabId: aba.id },
    func: () => window.lotecando?.estado() ?? null,
  });
  return resultado?.result ?? null;
}

// " O site recusou 3 jogo(s): linhas 4, 9 e 12 ("mensagem")." — agrupa pela mensagem do site; vazio se não houve.
function descreveRecusados(recusados = [], termo) {
  if (recusados.length === 0) return '';

  const porMensagem = new Map();
  for (const { numero, mensagem } of recusados) {
    porMensagem.set(mensagem, [...(porMensagem.get(mensagem) ?? []), numero]);
  }
  const grupos = [...porMensagem].map(([mensagem, linhas]) => {
    const mostradas = linhas.slice(0, 8).join(', ') + (linhas.length > 8 ? `… (+${linhas.length - 8})` : '');
    return `linha(s) ${mostradas}: "${mensagem}"`;
  });
  return ` O site recusou ${recusados.length} ${termo} — ${grupos.join('; ')}.`;
}

function acompanha(aba) {
  clearInterval(consulta);
  $('resumo').hidden = true;
  $('andamento').hidden = false;
  $('botaoCancelar').disabled = false;

  const atualiza = async () => {
    let estado;
    try {
      estado = await lerEstado(aba);
    } catch {
      return; // página recarregando; tenta de novo no próximo ciclo
    }
    if (!estado) return;

    const termo = MODALIDADES[estado.modalidade]?.termo ?? 'jogo(s)';
    $('barra').max = Math.max(estado.total, 1);
    const recusadosAteAgora = estado.recusados?.length ?? 0;
    $('barra').value = estado.feitos + recusadosAteAgora;
    $('andamentoTexto').textContent = `${estado.feitos} de ${estado.total} ${termo} no carrinho` +
      (recusadosAteAgora > 0 ? `, ${recusadosAteAgora} recusado(s) pelo site` : '') +
      (estado.rodando && estado.atual ? ` — preenchendo a linha ${estado.atual} do arquivo` : '');

    if (estado.rodando) return;
    clearInterval(consulta);
    $('andamento').hidden = true;
    $('resumo').hidden = volantes.length === 0;

    const recusados = descreveRecusados(estado.recusados, termo);
    if (estado.erro) {
      mostraMensagem(
        `Parei na linha ${estado.erro.numero} do arquivo: ${estado.erro.mensagem} ` +
        `${estado.feitos} ${termo} já estão no carrinho.${recusados} Confira o carrinho no site.`,
        'erro'
      );
    } else if (estado.concluido && recusados) {
      mostraMensagem(
        `Terminei, mas nem tudo entrou: ${estado.feitos} ${termo} no carrinho.${recusados} ` +
        'Confira o carrinho no site antes de pagar.',
        'erro'
      );
    } else if (estado.concluido) {
      mostraMensagem(`Pronto: ${estado.feitos} ${termo} no carrinho. Confira tudo no site antes de pagar.`, 'ok');
    } else {
      mostraMensagem(`Cancelado. ${estado.feitos} ${termo} já estão no carrinho.${recusados} Confira o carrinho no site.`);
    }
  };

  consulta = setInterval(atualiza, 500);
  atualiza();
}

// ---- Início -----------------------------------------------------------------------------------------------------

async function iniciaPrincipal() {
  const atual = await abaDaCaixa();
  $('pagina').textContent = atual
    ? `Página da ${MODALIDADES[atual.chave].nome} detectada.`
    : 'Abra a página da Loteca ou da Mega-Sena no site de Loterias Online da Caixa (e entre na sua conta).';

  // Se o popup foi fechado no meio de um preenchimento, volta a acompanhar.
  if (atual) {
    try {
      const estado = await lerEstado(atual.aba);
      if (estado?.rodando) acompanha(atual.aba);
    } catch {
      // script ainda não injetado nesta aba
    }
  }
}

(async () => {
  if (await aceiteFeito()) {
    $('principal').hidden = false;
    iniciaPrincipal();
  } else {
    $('aviso').hidden = false;
  }
})();
