# Extensão Chrome — Lotecando → Loterias Online da Caixa

Extensão do Chrome (Manifest V3) que lê os jogos gerados pelo Lotecando (arquivo `.vol`) e os
inscreve automaticamente no site de Loterias Online da Caixa (https://www.loteriasonline.caixa.gov.br/),
preenchendo o volante da Loteca e colocando cada aposta no carrinho.

## Regras do projeto

- Commits em português. O assunto começa com a tag da ferramenta: `[Claude] ` ou `[Codex] `.
  Exemplo: `[Claude] Adiciona leitura do arquivo .vol`.
- Não commitar sem o usuário pedir. Repositório git local na branch `main`.
- Nome da extensão: **Lotecando**; nome exibido: "Lotecando – Loterias Caixa" (não usar "Caixa" como
  se fosse extensão oficial). Repositório público no GitHub: `Lotecando-Extensao-Chrome`.
- Não copiar código do INJOLOCA (GPL-3.0): ele é só referência; a implementação é própria.
- Código e comentários em português, no estilo simples da extensão de referência.
- A extensão **nunca finaliza a compra/pagamento**: só preenche o volante e põe no carrinho.
  O usuário confere e paga manualmente.
- Documentação detalhada em `docs/` (ler antes de mexer):
  - `docs/formato-vol.md` — formato do arquivo `.vol` e mapeamento para o site.
  - `docs/referencia-injoloca.md` — como a extensão de referência INJOLOCA funciona e o que evitar.

## Origem das informações

- Padrão `.vol`: projeto Lotecando em `D:\Leonardo\Lotecando\Sistemas\Lotecando 3.0`
  (`Constantes.pas`, `Lib.pas` → `ContaApostas`, `UnitImpressaoA4.pas`). Exemplo em `exemplos/Exemplo.vol`.
- Referência: https://github.com/guynovaes/INJOLOCA (GPL-3.0; extensão de terceiros que preenche
  Loteca, Mega-Sena etc. a partir de texto colado num popup).

## Resumo do formato .vol (Loteca)

- Texto ASCII, fim de linha CRLF, **uma aposta (volante) por linha**, **14 caracteres** por linha
  (um por jogo, `NUMERO_DE_JOGOS = 14`), cada caractere é um dígito `1`–`7`.
- O dígito é uma máscara de bits das colunas marcadas: `4` = coluna 1, `2` = coluna X, `1` = coluna 2
  (soma para duplos/triplos: `6` = 1+X, `5` = 1+2, `3` = X+2, `7` = triplo).
- Aposta com duplos/triplos vale `produto` das marcas (1 para simples, 2 para duplo, 3 para triplo).

## Decisões

- Escopo inicial: **Loteca** (único formato `.vol` do Lotecando 3.0).
- Diferente do INJOLOCA, o usuário carrega o arquivo `.vol` direto (seletor de arquivo / arrastar),
  em vez de colar texto.

## Notas

- O site da Caixa muda com frequência; seletores do DOM (ids `limparvolante`, `colocarnocarrinho`,
  classe `a.loteca_palpite`) devem ficar isolados num único módulo para facilitar ajustes.
- A ordem dos links `a.loteca_palpite` no INJOLOCA é `jogo * 3 + coluna` (coluna 0=1, 1=X, 2=2). Confirmar no site atual.
- Pendente: criar a estrutura da extensão (`manifest.json`, popup, content script) — ainda não iniciada.
