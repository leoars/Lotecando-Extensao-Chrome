# Referência: INJOLOCA

Repositório: https://github.com/guynovaes/INJOLOCA (licença GPL-3.0 — respeitar ao reutilizar código).
Extensão MV3 de Guy Novaes para preencher apostas no site de Loterias Online da Caixa.

## Arquivos

- `manifest.json` — MV3; permissões `scripting`, `tabs`, `activeTab`; popup + service worker.
- `popup.html` / `popup.js` — UI: modalidade, quantidade de números, teimosinha, espelho, textarea com jogos.
- `background.js` — service worker (recebe `executar_script` ao trocar a modalidade).

## Como funciona (popup.js)

1. Usuário cola os jogos (uma linha por aposta) no textarea.
2. Para cada linha: `chrome.scripting.executeScript` injeta uma função na aba ativa que:
   `#limparvolante` → clica nos números (`#n<dezena>`) → `#colocarnocarrinho`.
3. Espera 600 ms entre jogos; barra de progresso no popup.
4. Loteca: linha com 14 tokens de 3 chars (ex.: `X__`), clica em `a.loteca_palpite[jogo*3 + coluna]`.

## O que evitar / melhorar na nossa versão

- `chrome.tabs.executeScript` (usado na Loteca) é MV2 e não funciona em MV3 — usar `chrome.scripting`.
- Interpolar a linha em código (`"(" + fn + ")('" + linha + "')"`) é frágil; passar via `args`.
- Cascata enorme de `if` por rótulo (TM01…TM80) — usar tabelas/laços.
- `alert()` para avisos — preferir mensagens no popup.
- Sem verificação de que o volante foi realmente preenchido; validar (ex.: contar marcas) antes de ir ao carrinho.
- Seletores espalhados — isolar num módulo (o site da Caixa muda).
