// Lotecando – Loterias Caixa
// Sem garantia. Uso por conta e risco do usuário; o autor não se responsabiliza pelos efeitos do uso.
// Projeto não oficial, sem vínculo com a Caixa Econômica Federal. Veja o README.md e a licença MIT.
//
// Gera dist/lotecando-<versão>.zip só com o que a Chrome Web Store precisa (manifest, src, icons, LICENSE), sem testes,
// documentos, scripts nem o perfil de teste. Uso: node scripts/empacotar.mjs
// O zip é escrito aqui mesmo (sem dependências): entradas com "/" e compactação deflate.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync, crc32 } from 'node:zlib';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(RAIZ, 'manifest.json'), 'utf8'));

// O que entra no pacote.
const ARQUIVOS_SOLTOS = ['manifest.json', 'LICENSE'];
const PASTAS = ['src', 'icons'];

function listaArquivos() {
  const lista = [...ARQUIVOS_SOLTOS];
  const percorre = (pasta) => {
    for (const nome of readdirSync(join(RAIZ, pasta)).sort()) {
      const caminho = join(pasta, nome);
      if (statSync(join(RAIZ, caminho)).isDirectory()) percorre(caminho);
      else lista.push(caminho.split(sep).join('/'));
    }
  };
  PASTAS.forEach(percorre);
  return lista;
}

// Data/hora fixas no formato MS-DOS (a primeira ocorrência de 1980 evita zips diferentes a cada geração).
const DATA_DOS = (0 << 9) | (1 << 5) | 1; // 1980-01-01
const HORA_DOS = 0;

function criaZip(nomes) {
  const partes = [];
  const central = [];
  let posicao = 0;

  for (const nome of nomes) {
    const conteudo = readFileSync(join(RAIZ, nome));
    const compactado = deflateRawSync(conteudo, { level: 9 });
    const nomeBytes = Buffer.from(nome, 'utf8');
    const crc = crc32(conteudo);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // versão necessária
    local.writeUInt16LE(0x0800, 6); // nomes em UTF-8
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(HORA_DOS, 10);
    local.writeUInt16LE(DATA_DOS, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compactado.length, 18);
    local.writeUInt32LE(conteudo.length, 22);
    local.writeUInt16LE(nomeBytes.length, 26);
    partes.push(local, nomeBytes, compactado);

    const entrada = Buffer.alloc(46);
    entrada.writeUInt32LE(0x02014b50, 0);
    entrada.writeUInt16LE(20, 4);
    entrada.writeUInt16LE(20, 6);
    entrada.writeUInt16LE(0x0800, 8);
    entrada.writeUInt16LE(8, 10);
    entrada.writeUInt16LE(HORA_DOS, 12);
    entrada.writeUInt16LE(DATA_DOS, 14);
    entrada.writeUInt32LE(crc, 16);
    entrada.writeUInt32LE(compactado.length, 20);
    entrada.writeUInt32LE(conteudo.length, 24);
    entrada.writeUInt16LE(nomeBytes.length, 28);
    entrada.writeUInt32LE(posicao, 42);
    central.push(entrada, nomeBytes);

    posicao += local.length + nomeBytes.length + compactado.length;
  }

  const diretorio = Buffer.concat(central);
  const fim = Buffer.alloc(22);
  fim.writeUInt32LE(0x06054b50, 0);
  fim.writeUInt16LE(nomes.length, 8);
  fim.writeUInt16LE(nomes.length, 10);
  fim.writeUInt32LE(diretorio.length, 12);
  fim.writeUInt32LE(posicao, 16);
  return Buffer.concat([...partes, diretorio, fim]);
}

const nomes = listaArquivos();
const saida = join(RAIZ, 'dist', `lotecando-${manifest.version}.zip`);
mkdirSync(dirname(saida), { recursive: true });
const zip = criaZip(nomes);
writeFileSync(saida, zip);

console.log(`${relative(RAIZ, saida)}: ${nomes.length} arquivos, ${(zip.length / 1024).toFixed(1)} KB (versão ${manifest.version})`);
nomes.forEach((n) => console.log('  ' + n));
