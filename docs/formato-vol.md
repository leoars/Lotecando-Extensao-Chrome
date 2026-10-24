# Formato do arquivo .vol (Lotecando 3.0)

Fonte: `D:\Leonardo\Lotecando\Sistemas\Lotecando 3.0` — `Constantes.pas` (`EXTENSAO_VOLANTES = '.vol'`,
`NUMERO_DE_JOGOS = 14`), `Lib.pas` (`ContaApostas`), `UnitImpressaoA4.pas` / `UnitImpressaoVolanteCaixa.pas`
(impressão dos volantes). Exemplo real: `exemplos/Exemplo.vol` (334 linhas).

## Estrutura

- ASCII, linhas terminadas em CRLF.
- Uma linha = um volante/aposta. Exatamente 14 caracteres (um por jogo da Loteca).
- Cada caractere é um dígito de `1` a `7`.

## Significado do dígito (máscara de bits)

| Dígito | Colunas marcadas | Tipo   | Multiplicador |
|--------|------------------|--------|---------------|
| 4      | 1                | simples| 1 |
| 2      | X                | simples| 1 |
| 1      | 2                | simples| 1 |
| 6      | 1 e X            | duplo  | 2 |
| 5      | 1 e 2            | duplo  | 2 |
| 3      | X e 2            | duplo  | 2 |
| 7      | 1, X e 2         | triplo | 3 |

Bit 4 = coluna 1, bit 2 = coluna X, bit 1 = coluna 2. Confirmado em `UnitImpressaoA4.pas`
(`'4'` → `C1_`, `'2'` → `CX_`, `'1'` → `C2_`, `'6'` → C1+CX, `'5'` → C1+C2, `'3'` → CX+C2, `'7'` → as três).

Número de apostas do volante = produto dos multiplicadores dos 14 jogos (`ContaApostas`).

## Exemplo

`14112116444124` → jogo 1: col.1; jogo 2: col.2; jogo 3: col.2; jogo 4: col.X; jogo 5: col.2;
jogo 6: col.2; jogo 7: col.1+X (duplo); jogo 8: col.1 ... (multiplicador total = 2).

## Mapeamento para o site da Caixa (a validar)

Na extensão de referência, para a Loteca: `document.querySelectorAll("a.loteca_palpite")` retorna 42 links
(14 jogos × 3 colunas) na ordem `jogo*3 + coluna`, com coluna 0 = "1", 1 = "X", 2 = "2". Para cada dígito do
`.vol`, clicar nos links das colunas marcadas; depois `#colocarnocarrinho`. Antes de cada volante, `#limparvolante`.

## Outros arquivos relacionados

- `.jgo` — arquivo de jogo do Lotecando (INI: `[Concurso]`, `[Marcas]` ...). Não é usado pela extensão.
- `.exclusao.vol` — volantes excluídos (mesmo formato do `.vol`).
