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
- Volante **fora dos limites** (14 palpites simples, ou acima de 864 apostas como 14 triplos; ver a seção seguinte): o
  site recusa ao clicar em "Colocar no Carrinho" com o modal `#alert` (`.modal.fade.in`): "É preciso palpitar em todos os jogos, e no mínimo um deles deve ser duplo,
  para colocar sua aposta no carrinho." Botão de fechar: `.data-fechar-modal-alerta` (`data-dismiss="modal"`). O volante
  continua marcado depois do aviso; é preciso fechar o modal e clicar em `#limparvolante`.
- Em uma ocasião, um volante todo simples não gerou modal nem entrou no carrinho (o volante só ficou marcado); não
  reproduzido depois, mas a extensão trata os dois casos (com e sem aviso) como "recusado pelo site".
- Para combinação que o site não aceita (ex.: 14 triplos), `.valor-aposta` mostra o mínimo `R$ 4,00` em vez do valor
  calculado. A extensão compara o valor do site com `apostas × preço por aposta` (R$ 2,00, aprendido do primeiro volante
  aceito) e não envia ao carrinho se divergir.
- Preço: R$ 2,00 por aposta (duplo = 2 apostas = R$ 4,00, mínimo de uma aposta válida).

## Limites de duplos e triplos (mapeados em 24/10/2026)

Fonte: tabela de preços de https://loterias.caixa.gov.br/Paginas/Loteca.aspx, conferida no site de apostas lendo o
`.valor-aposta` de 56 combinações (triplos 0 a 7, duplos 0 a 10) e testando no carrinho os casos de fronteira.

**Regra: o volante precisa ter de 2 a 864 apostas** (apostas = 2^duplos × 3^triplos; preço R$ 2,00 por aposta, de R$ 4,00 a
R$ 1.728,00). O site aceita exatamente as combinações da tabela oficial:

| Triplos | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| Duplos permitidos | 1 a 9 | 0 a 8 | 0 a 6 | 0 a 5 | 0 a 3 | 0 a 1 | 0 |
| Maior volante (apostas) | 512 | 768 | 576 | 864 | 648 | 486 | 729 |

- Máximo geral: **3 triplos e 5 duplos = 864 apostas (R$ 1.728,00)**; também permitidos 6 triplos (729) e 1 triplo com
  8 duplos (768). Um triplo sem nenhum duplo vale (3 apostas, R$ 6,00); só **nenhum duplo nem triplo** (1 aposta) não vale.
- Acima de 864 apostas (ex.: 3 triplos e 6 duplos = 1.728; 1 triplo e 9 duplos; 7 triplos) o site não calcula o valor:
  `.valor-aposta` mostra o mínimo `R$ 4,00` e o carrinho recusa. A mensagem do site, "no mínimo um deles deve ser duplo",
  aparece também nesses casos e é enganosa: o problema é o limite máximo.
- Testado no carrinho: 1 triplo sem duplo (3 apostas, aceito), 3 triplos e 5 duplos (864, aceito, R$ 1.728,00) e
  3 triplos e 6 duplos (1.728, recusado). Todas as combinações da tabela deram o valor esperado em `.valor-aposta`.
- A extensão aplica a regra antes de enviar (`src/vol.js`: `MINIMO_DE_APOSTAS`, `MAXIMO_DE_APOSTAS`, `foraDoLimite`), com
  teste automático que compara todas as combinações possíveis com a tabela; o site continua sendo a última palavra.

## Pontos a verificar ainda

- Outros modais do DOM (`.msg-confirm` "Sim/Não", `.msg-ul` "Confirmar/Cancelar", "Entendi") não foram vistos em uso.
- Regras da Loteca (mínimo de jogos marcados, máximo de duplos/triplos) para validar o `.vol` antes de enviar.
- Contador do carrinho e limite diário (R$ 9.300,00 exibido na página).
