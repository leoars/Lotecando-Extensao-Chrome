// Lotecando – Loterias Caixa
// Sem garantia. Uso por conta e risco do usuário; o autor não se responsabiliza pelos efeitos do uso.
// Projeto não oficial, sem vínculo com a Caixa Econômica Federal. Veja o README.md e a licença MIT.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { converteLinha, leVol, totalDeApostas } from '../src/vol.js';

test('aposta simples marca uma coluna por jogo', () => {
  // 4 = coluna 1, 2 = X, 1 = coluna 2
  const r = converteLinha('42142142142142');
  assert.equal(r.apostas, 1);
  assert.equal(r.marcas.length, 14);
  assert.deepEqual(r.marcas.slice(0, 3), [0, 4, 8]);
});

test('duplos e triplos multiplicam as apostas', () => {
  assert.deepEqual(converteLinha('66444444444444'), {
    marcas: [0, 1, 3, 4, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39],
    apostas: 4,
  });
  assert.equal(converteLinha('77444444444444').apostas, 9);
  assert.equal(converteLinha('35444444444444').apostas, 4);
});

test('linha do Exemplo.vol confere com o que o site marcou em 24/10/2026', () => {
  const r = converteLinha('14112116444124');
  assert.deepEqual(r.marcas, [2, 3, 8, 11, 13, 17, 20, 21, 22, 24, 27, 30, 35, 37, 39]);
  assert.equal(r.apostas, 2);
});

test('linhas inválidas são rejeitadas', () => {
  for (const linha of ['', '1411211644412', '141121164441244', '1411211644412a', '04112116444124', '8' + '4'.repeat(13)]) {
    assert.equal(converteLinha(linha), null, `deveria rejeitar "${linha}"`);
  }
});

test('leVol aceita CRLF, ignora linhas em branco e numera pelas linhas do arquivo', () => {
  const { volantes, invalidas } = leVol('14112116444124\r\n\r\nxxx\r\n44444444444444\r\n');
  assert.deepEqual(volantes.map((v) => v.numero), [1, 4]);
  assert.deepEqual(invalidas, [{ numero: 3, linha: 'xxx' }]);
  assert.equal(totalDeApostas(volantes), 3);
});

test('Exemplo.vol do Lotecando é lido por inteiro', () => {
  const texto = readFileSync(new URL('../exemplos/Exemplo.vol', import.meta.url), 'utf8');
  const { volantes, invalidas } = leVol(texto);
  assert.equal(invalidas.length, 0);
  assert.equal(volantes.length, 334);
});
