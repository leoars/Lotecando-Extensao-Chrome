// Lotecando para Loterias Caixa
// Sem garantia. Uso por conta e risco do usuário; o autor não se responsabiliza pelos efeitos do uso.
// Projeto não oficial, sem vínculo com a Caixa Econômica Federal. Veja o README.md e a licença MIT.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { combinacoes, converteJogo, leJogos } from '../src/mega.js';

test('combinações de dezenas (apostas simples de 6 que o jogo vale)', () => {
  assert.equal(combinacoes(6), 1);
  assert.equal(combinacoes(7), 7);
  assert.equal(combinacoes(8), 28);
  assert.equal(combinacoes(15), 5005);
  assert.equal(combinacoes(20), 38760);
});

test('jogo de 6 dezenas vira ids do site em ordem', () => {
  const jogo = converteJogo('49 01 24 17 11 04');
  assert.deepEqual(jogo.marcas, ['n01', 'n04', 'n11', 'n17', 'n24', 'n49']);
  assert.equal(jogo.apostas, 1);
  assert.equal(jogo.aumentos, 0);
});

test('jogo com mais de 6 dezenas pede aumentos da quantidade', () => {
  const jogo = converteJogo('01 02 03 04 05 06 07 08');
  assert.equal(jogo.apostas, 28);
  assert.equal(jogo.aumentos, 2);
});

test('linhas inválidas são rejeitadas', () => {
  for (const linha of [
    '', '01 02 03 04 05', '01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21', '00 02 03 04 05 06',
    '01 02 03 04 05 61', '01 02 03 04 05 05', '1 2 3 4 5 6', '01 02 03 04 05 xx',
  ]) {
    assert.equal(converteJogo(linha), null, `deveria rejeitar "${linha}"`);
  }
});

test('leJogos aceita CRLF, ignora linhas em branco, numera pelo arquivo e avisa repetidas', () => {
  const { volantes, invalidas, repetidas } = leJogos('01 04 11 17 24 49\r\n\r\nlixo\r\n49 24 17 11 04 01\r\n10 17 26 38 50 55\r\n');
  assert.deepEqual(volantes.map((v) => v.numero), [1, 4, 5]);
  assert.deepEqual(invalidas, [{ numero: 3, linha: 'lixo' }]);
  assert.deepEqual(repetidas, [{ numero: 4, igualALinha: 1 }]);
});

test('arquivo real do bolão 3074, se existir nesta máquina, é lido sem linhas inválidas', (contexto) => {
  const caminho = 'D:/Leonardo/Lotecando/WEB/dados/arquivos/mega-sena-3074.txt';
  if (!existsSync(caminho)) return contexto.skip('arquivo não existe nesta máquina');
  const { volantes, invalidas, repetidas } = leJogos(readFileSync(caminho, 'latin1'));
  assert.equal(invalidas.length, 0);
  assert.equal(repetidas.length, 0);
  assert.equal(volantes.length, 125);
  assert.ok(volantes.every((v) => v.apostas === 1));
});
