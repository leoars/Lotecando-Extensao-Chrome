// Lotecando – Loterias Caixa
// Sem garantia. Uso por conta e risco do usuário; o autor não se responsabiliza pelos efeitos do uso.
// Projeto não oficial, sem vínculo com a Caixa Econômica Federal. Veja o README.md e a licença MIT.
//
// Leitura e validação do arquivo .vol do Lotecando (Loteca). Formato em docs/formato-vol.md.

export const NUMERO_DE_JOGOS = 14;

// Cada dígito do .vol é uma máscara de bits: 4 = coluna 1, 2 = coluna X, 1 = coluna 2.
// O índice é a posição da coluna dentro do jogo no site (0 = coluna 1, 1 = X, 2 = coluna 2).
const BITS_DAS_COLUNAS = [
  [4, 0],
  [2, 1],
  [1, 2],
];

// Converte uma linha do .vol em {marcas, apostas}. Devolve null se a linha for inválida.
// marcas: índices em a.loteca_palpite (jogo * 3 + coluna); apostas: produto dos duplos/triplos.
export function converteLinha(linha) {
  if (!new RegExp(`^[1-7]{${NUMERO_DE_JOGOS}}$`).test(linha)) return null;

  const marcas = [];
  let apostas = 1;
  for (let jogo = 0; jogo < NUMERO_DE_JOGOS; jogo++) {
    const digito = Number(linha[jogo]);
    let colunasMarcadas = 0;
    for (const [bit, coluna] of BITS_DAS_COLUNAS) {
      if (digito & bit) {
        marcas.push(jogo * 3 + coluna);
        colunasMarcadas++;
      }
    }
    apostas *= colunasMarcadas;
  }
  return { marcas, apostas };
}

// Lê o texto de um .vol. "numero" é o número da linha no arquivo (começa em 1).
export function leVol(texto) {
  const volantes = [];
  const invalidas = [];

  texto.split(/\r?\n/).forEach((conteudo, indice) => {
    const linha = conteudo.trim();
    if (linha === '') return;

    const numero = indice + 1;
    const convertida = converteLinha(linha);
    if (convertida) {
      volantes.push({ numero, linha, ...convertida });
    } else {
      invalidas.push({ numero, linha });
    }
  });

  return { volantes, invalidas };
}

export function totalDeApostas(volantes) {
  return volantes.reduce((soma, volante) => soma + volante.apostas, 0);
}
