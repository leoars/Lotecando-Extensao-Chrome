// Lotecando – Loterias Caixa
// Sem garantia. Uso por conta e risco do usuário; o autor não se responsabiliza pelos efeitos do uso.
// Projeto não oficial, sem vínculo com a Caixa Econômica Federal. Veja o README.md e a licença MIT.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { converteLinha, leVol, totalDeApostas, foraDoLimite, MINIMO_DE_APOSTAS, MAXIMO_DE_APOSTAS } from '../src/vol.js';

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

test('limites da Loteca batem com a tabela de preços da Caixa (triplos -> maior número de duplos permitido)', () => {
  // Tabela oficial (loterias.caixa.gov.br/Paginas/Loteca.aspx) e conferida no site em 24/10/2026.
  // Com 0 triplos, de 1 a 9 duplos; nos demais, de 0 ao máximo abaixo.
  const maximoDeDuplos = { 0: 9, 1: 8, 2: 6, 3: 5, 4: 3, 5: 1, 6: 0 };
  assert.equal(MINIMO_DE_APOSTAS, 2);
  assert.equal(MAXIMO_DE_APOSTAS, 864);

  for (let triplos = 0; triplos <= 14; triplos++) {
    for (let duplos = 0; triplos + duplos <= 14; duplos++) {
      const linha = '7'.repeat(triplos) + '6'.repeat(duplos) + '4'.repeat(14 - triplos - duplos);
      const volante = converteLinha(linha);
      const permitido = triplos in maximoDeDuplos && duplos <= maximoDeDuplos[triplos] && triplos + duplos > 0;
      assert.equal(!foraDoLimite(volante), permitido, `${triplos} triplos e ${duplos} duplos (${volante.apostas} apostas)`);
    }
  }
});

test('máximos citados pelo Leonardo: 729, 768 e 864 apostas são permitidos', () => {
  assert.equal(converteLinha('77777744444444').apostas, 729); // 6 triplos
  assert.equal(converteLinha('76666666644444').apostas, 768); // 1 triplo e 8 duplos
  assert.equal(converteLinha('77766666444444').apostas, 864); // 3 triplos e 5 duplos
  for (const linha of ['77777744444444', '76666666644444', '77766666444444']) {
    assert.equal(foraDoLimite(converteLinha(linha)), false, linha);
  }
  assert.equal(foraDoLimite(converteLinha('77766666644444')), true); // 1728 apostas
  assert.equal(foraDoLimite(converteLinha('44444444444444')), true); // 1 aposta
});

test('Exemplo.vol do Lotecando é lido por inteiro', () => {
  const texto = readFileSync(new URL('../exemplos/Exemplo.vol', import.meta.url), 'utf8');
  const { volantes, invalidas } = leVol(texto);
  assert.equal(invalidas.length, 0);
  assert.equal(volantes.length, 334);
});
