# Site da Caixa — tela da Loteca (levantamento)

URL: `https://www.loteriasonline.caixa.gov.br/silce-web/#/loteca` (AngularJS, SPA com rota por hash).
Levantado em 24/10/2026 (concurso 1277), com usuário logado, por inspeção do DOM. Só foram feitas marcações e
"Limpar Volante"; nada foi colocado no carrinho nem pago. O site muda com frequência: reconferir antes de relançar.

## Seletores confirmados

| Elemento | Seletor | Observação |
|---|---|---|
| Palpites do volante | `a.loteca_palpite` | 42 links = 14 jogos × 3 colunas, em ordem de leitura: índice `jogo*3 + coluna` (coluna 0 = "Coluna 1", 1 = "X", 2 = "Coluna 2"); jogo é 0..13 |
| Container dos palpites | `div.numeros-volante_loteca` | pai de cada link |
| Palpite marcado | classe `loteca_palpite_selecionado` no próprio `a` | durante a animação aparecem `ng-animate` e `loteca_palpite_selecionado-add` / `-remove`; esperar ~1 s antes de ler o estado |
| Limpar volante | `button#limparvolante` / `.data-limpar-volante-loteca` | |
| Colocar no carrinho | `button#colocarnocarrinho` / `.data-incluir-aposta-loteca` | ainda **não** clicado nos testes |
| Valor da aposta atual | `.valor-aposta` (texto "Valor da Aposta: R$ x,xx") | |

Os ids `apostaEspelho` e `aumentarteimosinha` (usados pelo INJOLOCA em outras loterias) **não existem** na Loteca.

## Teste de ponta a ponta (24/10/2026)

Volante `14112116444124` (1ª linha de `exemplos/Exemplo.vol`, 1 duplo = 2 apostas):
- Marcar os palpites por `click()` nos links `a.loteca_palpite` funciona (14 jogos, 15 marcas — 1 por jogo mais 1 do duplo no jogo 8; índices
  2,3,8,11,13,17,20,21,22,24,27,30,35,37,39), sem precisar de eventos extras.
- `#colocarnocarrinho` → a aposta entra no carrinho (contador do cabeçalho 0→1, total R$ 4,00 = 2 apostas × R$ 2,00),
  **o volante é limpo sozinho** (0 marcas selecionadas depois) e **nenhum modal** aparece. Não precisa chamar
  `#limparvolante` entre volantes (mas é seguro chamar antes).
- O item aparece em "Apostas recentes" com uma lixeira: `a.data-remover_aposta_carrinho_resumido`
  (remove na hora, sem confirmação). Foi usada para desfazer o teste; carrinho voltou a R$ 0,00.
- Valor: `.valor-aposta` mostra o valor do volante atual (R$ 2,00 por aposta simples). Os R$ 4,00 vistos antes com 1 e 3
  marcas em volante incompleto ainda não têm explicação; para volante completo o valor bate com `ContaApostas × 2`.

## Recusas do site (testado em 24/10/2026)

- Contador de volantes no carrinho: `#carrinho` (`a.data-jogo-menu-carrinho`), 1 por volante, texto numérico no cabeçalho.
  Sobe quando a aposta entra de verdade; a extensão usa isso para confirmar cada volante.
- Volante **sem nenhum duplo** (14 palpites simples, ou só triplos): o site recusa ao clicar em "Colocar no Carrinho"
  com o modal `#alert` (`.modal.fade.in`): "É preciso palpitar em todos os jogos, e no mínimo um deles deve ser duplo,
  para colocar sua aposta no carrinho." Botão de fechar: `.data-fechar-modal-alerta` (`data-dismiss="modal"`). O volante
  continua marcado depois do aviso; é preciso fechar o modal e clicar em `#limparvolante`.
- Em uma ocasião, um volante todo simples não gerou modal nem entrou no carrinho (o volante só ficou marcado); não
  reproduzido depois, mas a extensão trata os dois casos (com e sem aviso) como "recusado pelo site".
- Para combinação que o site não aceita (ex.: 14 triplos), `.valor-aposta` mostra o mínimo `R$ 4,00` em vez do valor
  calculado. A extensão compara o valor do site com `apostas × preço por aposta` (R$ 2,00, aprendido do primeiro volante
  aceito) e não envia ao carrinho se divergir.
- Preço: R$ 2,00 por aposta (duplo = 2 apostas = R$ 4,00, mínimo de uma aposta válida).

## Pontos a verificar ainda

- Limites exatos de duplos e triplos além de "pelo menos um duplo" (só 14 triplos e 14 simples foram testados).
- Outros modais do DOM (`.msg-confirm` "Sim/Não", `.msg-ul` "Confirmar/Cancelar", "Entendi") não foram vistos em uso.
- Regras da Loteca (mínimo de jogos marcados, máximo de duplos/triplos) para validar o `.vol` antes de enviar.
- Contador do carrinho e limite diário (R$ 9.300,00 exibido na página).
