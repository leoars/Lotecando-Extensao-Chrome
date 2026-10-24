// Lotecando – Loterias Caixa
// Sem garantia. Uso por conta e risco do usuário; o autor não se responsabiliza pelos efeitos do uso.
// Projeto não oficial, sem vínculo com a Caixa Econômica Federal. Veja o README.md e a licença MIT.

import { leVol, totalDeApostas } from './vol.js';

const URL_DA_LOTECA = /^https:\/\/www\.loteriasonline\.caixa\.gov\.br\/silce-web\/.*#\/loteca/;
const VERSAO_DO_AVISO = 1; // aumentar quando o aviso legal mudar, para pedir novo aceite

const $ = (id) => document.getElementById(id);

let volantes = [];
let consulta = null;

function mostraMensagem(texto, tipo = '') {
  const mensagem = $('mensagem');
  mensagem.textContent = texto;
  mensagem.className = tipo;
}

async function abaAtiva() {
  const [aba] = await chrome.tabs.query({ active: true, currentWindow: true });
  return aba;
}

async function estaNaLoteca() {
  const aba = await abaAtiva();
  return aba && URL_DA_LOTECA.test(aba.url ?? '') ? aba : null;
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

// ---- Arquivo .vol -----------------------------------------------------------------------------------------------

$('arquivo').addEventListener('change', async (evento) => {
  const arquivo = evento.target.files[0];
  $('resumo').hidden = true;
  mostraMensagem('');
  volantes = [];
  if (!arquivo) return;

  const { volantes: lidos, invalidas } = leVol(await arquivo.text());
  volantes = lidos;

  const invalidasEl = $('invalidas');
  if (invalidas.length > 0) {
    const exemplo = invalidas.slice(0, 5).map((i) => `linha ${i.numero}`).join(', ');
    invalidasEl.textContent =
      `${invalidas.length} linha(s) inválida(s) ignorada(s) (${exemplo}${invalidas.length > 5 ? '…' : ''}). ` +
      'Cada linha deve ter 14 dígitos de 1 a 7.';
    invalidasEl.hidden = false;
  } else {
    invalidasEl.hidden = true;
  }

  if (volantes.length === 0) {
    mostraMensagem('Nenhum volante válido neste arquivo. Ele é mesmo um .vol da Loteca?', 'erro');
    return;
  }

  $('resumoTexto').textContent =
    `${volantes.length} volante(s), ${totalDeApostas(volantes)} aposta(s) no total ` +
    `(primeira linha: ${volantes[0].linha}).`;
  $('inicio').max = String(volantes.length);
  $('inicio').value = '1';
  $('resumo').hidden = false;
});

// ---- Execução ---------------------------------------------------------------------------------------------------

async function injeta(aba) {
  await chrome.scripting.executeScript({ target: { tabId: aba.id }, files: ['src/conteudo.js'] });
}

$('botaoIniciar').addEventListener('click', async () => {
  const aba = await estaNaLoteca();
  if (!aba) {
    mostraMensagem('Abra a página da Loteca no site de Loterias Online da Caixa e tente de novo.', 'erro');
    return;
  }

  const inicio = Math.min(Math.max(parseInt($('inicio').value, 10) || 1, 1), volantes.length);
  const fila = volantes.slice(inicio - 1);

  try {
    await injeta(aba);
    await chrome.scripting.executeScript({
      target: { tabId: aba.id },
      func: (lista) => {
        window.lotecando.iniciar(lista);
        return true;
      },
      args: [fila],
    });
  } catch (erro) {
    mostraMensagem(`Não consegui acessar a página: ${erro.message}`, 'erro');
    return;
  }

  mostraMensagem('');
  acompanha(aba);
});

$('botaoCancelar').addEventListener('click', async () => {
  const aba = await estaNaLoteca();
  if (!aba) return;
  await chrome.scripting.executeScript({
    target: { tabId: aba.id },
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

    $('barra').max = Math.max(estado.total, 1);
    $('barra').value = estado.feitos;
    $('andamentoTexto').textContent = `${estado.feitos} de ${estado.total} volante(s) no carrinho` +
      (estado.rodando && estado.atual ? ` — preenchendo a linha ${estado.atual} do arquivo` : '');

    if (estado.rodando) return;
    clearInterval(consulta);
    $('andamento').hidden = true;
    $('resumo').hidden = volantes.length === 0;

    if (estado.erro) {
      mostraMensagem(
        `Parei na linha ${estado.erro.numero} do arquivo: ${estado.erro.mensagem} ` +
        `${estado.feitos} volante(s) já estão no carrinho. Confira o carrinho no site.`,
        'erro'
      );
    } else if (estado.concluido) {
      mostraMensagem(`Pronto: ${estado.feitos} volante(s) no carrinho. Confira tudo no site antes de pagar.`, 'ok');
    } else {
      mostraMensagem(`Cancelado. ${estado.feitos} volante(s) já estão no carrinho. Confira o carrinho no site.`);
    }
  };

  consulta = setInterval(atualiza, 500);
  atualiza();
}

// ---- Início -----------------------------------------------------------------------------------------------------

async function iniciaPrincipal() {
  const aba = await estaNaLoteca();
  $('pagina').textContent = aba
    ? 'Página da Loteca detectada.'
    : 'Abra a página da Loteca no site de Loterias Online da Caixa (e entre na sua conta).';

  // Se o popup foi fechado no meio de um preenchimento, volta a acompanhar.
  if (aba) {
    try {
      const estado = await lerEstado(aba);
      if (estado?.rodando) acompanha(aba);
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
