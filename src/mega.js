// Lotecando – Loterias Caixa
// Sem garantia. Uso por conta e risco do usuário; o autor não se responsabiliza pelos efeitos do uso.
// Projeto não oficial, sem vínculo com a Caixa Econômica Federal. Veja o README.md e a licença MIT.
//
// Leitura e validação dos jogos da Mega-Sena: um .txt com um jogo por linha, dezenas de dois dígitos separadas por
// espaço (ex.: "01 04 11 17 24 49"), como o site do Lotecando gera em "Baixar .txt para a Caixa".

export const MINIMO_DE_DEZENAS = 6;
export const MAXIMO_DE_DEZENAS = 20;
export const MAIOR_DEZENA = 60;

// Combinações de n dezenas tomadas de 6 em 6 (quantas apostas simples o jogo vale).
export function combinacoes(n, k = 6) {
  let resultado = 1;
  for (let i = 1; i <= k; i++) resultado = (resultado * (n - k + i)) / i;
  return Math.round(resultado);
}

// Converte uma linha em {marcas, dezenas, apostas, aumentos}; devolve null se a linha for inválida.
// marcas: ids das dezenas no site ("n01"..."n60"), em ordem; aumentos: dezenas acima de 6 (cliques em "aumentar número").
export function converteJogo(linha) {
  const partes = linha.trim().split(/[\s,;]+/);
  if (partes.length < MINIMO_DE_DEZENAS || partes.length > MAXIMO_DE_DEZENAS) return null;
  if (!partes.every((p) => /^\d{2}$/.test(p))) return null;

  const dezenas = partes.map(Number).sort((a, b) => a - b);
  if (dezenas.some((d) => d < 1 || d > MAIOR_DEZENA)) return null;
  if (new Set(dezenas).size !== dezenas.length) return null;

  return {
    dezenas,
    marcas: dezenas.map((d) => `n${String(d).padStart(2, '0')}`),
    apostas: combinacoes(dezenas.length),
    aumentos: dezenas.length - MINIMO_DE_DEZENAS,
  };
}

// Lê o texto do arquivo. "numero" é o número da linha no arquivo (começa em 1). Linhas repetidas viram aviso, não erro:
// ficam em "repetidas" e são mantidas (o usuário decide).
export function leJogos(texto) {
  const volantes = [];
  const invalidas = [];
  const vistas = new Map();
  const repetidas = [];

  texto.split(/\r?\n/).forEach((conteudo, indice) => {
    const linha = conteudo.trim();
    if (linha === '') return;

    const numero = indice + 1;
    const convertido = converteJogo(linha);
    if (!convertido) {
      invalidas.push({ numero, linha });
      return;
    }

    volantes.push({ numero, linha, ...convertido });
    const chave = convertido.marcas.join('');
    if (vistas.has(chave)) repetidas.push({ numero, igualALinha: vistas.get(chave) });
    else vistas.set(chave, numero);
  });

  return { volantes, invalidas, repetidas };
}
