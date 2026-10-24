// Lotecando para Loterias Caixa
// Sem garantia. Uso por conta e risco do usuário; o autor não se responsabiliza pelos efeitos do uso.
// Projeto não oficial, sem vínculo com a Caixa Econômica Federal. Veja o README.md e a licença MIT.
//
// Abre um Chrome SEPARADO, só para testes, com a extensão carregada e um perfil fixo (.perfil-teste/, fora do Git).
// O login no site da Caixa é feito à mão, uma vez, e fica salvo nesse perfil. Não altera o seu Chrome de uso diário.
// Uso: node scripts/abrir-chrome-teste.mjs   (porta de depuração 9333; fechar a janela encerra o teste)

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PERFIL = join(RAIZ, '.perfil-teste');
const PORTA = 9333;
const CHROME = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL_DA_LOTECA = 'https://www.loteriasonline.caixa.gov.br/silce-web/#/loteca';

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  `--user-data-dir=${PERFIL}`, `--remote-debugging-port=${PORTA}`, '--enable-unsafe-extension-debugging',
  '--no-first-run', '--no-default-browser-check', URL_DA_LOTECA,
], { detached: true, stdio: 'ignore' });
chrome.unref();

let versao;
for (let i = 0; i < 60 && !versao; i++) {
  try { versao = await (await fetch(`http://127.0.0.1:${PORTA}/json/version`)).json(); } catch { await esperar(300); }
}
if (!versao) throw new Error('O Chrome de teste não abriu a porta de depuração.');

// A extensão é carregada de novo a cada abertura (o Chrome não guarda extensões carregadas por depuração).
const ws = new WebSocket(versao.webSocketDebuggerUrl);
await new Promise((resolve) => (ws.onopen = resolve));
const resposta = await new Promise((resolve) => {
  ws.onmessage = (e) => resolve(JSON.parse(e.data));
  ws.send(JSON.stringify({ id: 1, method: 'Extensions.loadUnpacked', params: { path: RAIZ } }));
});
ws.close();

if (!resposta.result?.id) throw new Error(`Não consegui carregar a extensão: ${JSON.stringify(resposta.error)}`);
console.log(`Chrome de teste aberto. Extensão carregada (id ${resposta.result.id}).`);
