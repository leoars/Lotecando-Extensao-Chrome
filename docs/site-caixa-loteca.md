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

## Pontos a verificar ainda

- Ao clicar em "Colocar no Carrinho": comportamento, mensagens de erro (volante incompleto, limite de duplos/triplos) e
  modais (`.msg-confirm`, `.msg-ul` existem no DOM: "Sim/Não", "Confirmar/Cancelar", "Entendi").
- Valor exibido: com 1 marca e com 3 marcas apareceu `R$ 4,00` nos dois casos — entender a regra antes de usar o valor
  como conferência.
- Regras da Loteca (mínimo de jogos marcados, máximo de duplos/triplos) para validar o `.vol` antes de enviar.
- Contador do carrinho e limite diário (R$ 9.300,00 exibido na página).
