# Site da Caixa — tela da Mega-Sena (levantamento)

URL: `https://www.loteriasonline.caixa.gov.br/silce-web/#/mega-sena` (mesmo AngularJS da Loteca).
Levantado em 24/10/2026 (concurso 3074, encerra 20h00, sorteio 21h00), com usuário logado, por inspeção do DOM e testes no
carrinho do Chrome de teste (tudo removido depois). Seletores e comportamento comuns à Loteca estão em
`docs/site-caixa-loteca.md` (contador `#carrinho`, modal `#alert`, botões `#limparvolante` e `#colocarnocarrinho`).

## Arquivo de entrada

`.txt` gerado pelo site Lotecando ("Baixar .txt para a Caixa"): um jogo por linha, dezenas de dois dígitos separadas por
espaço, CRLF. Ex.: `01 04 11 17 24 49`. Exemplo real: 125 jogos de 6 dezenas (`mega-sena-3074.txt`, dado do bolão: fica em
`D:\Leonardo\Lotecando\WEB\dados\arquivos`, não neste repositório). Leitura e validação em `src/mega.js`.

## Seletores confirmados

| Elemento | Seletor | Observação |
|---|---|---|
| Dezenas | `a#n01` … `a#n60` | clicar marca; a dezena marcada ganha a classe `selected` |
| Limpar | `button#limparvolante` | |
| Colocar no carrinho | `button#colocarnocarrinho` | o site limpa o volante sozinho quando aceita |
| Valor | `#valoraposta` (texto "R$ 6,00") | R$ 6,00 por aposta de 6 dezenas |
| Quantidade de números | `#aumentarnumero` / `#diminuirnumero` | cada clique em aumentar libera mais uma dezena (acima de 6) |
| Teimosinha | `#aumentarteimosinha` / `#diminuirteimosinha` | não usado pela extensão |
| Outros | `#completeojogo`, `#surpresinha` | não usados |
| Modais | `#alert` (fechar: `#fecharModalAlerta`), `#error`, `#confirm`, `#modalQtdNumeros` | só o `#alert` foi visto em uso |

## Comportamento testado

- 6 dezenas: marcar as 6 e colocar no carrinho funciona; o contador `#carrinho` sobe 1 por jogo.
- Sem aumentar a quantidade, a 7ª dezena clicada é **ignorada** (sem aviso). A extensão clica em `#aumentarnumero`
  (dezenas − 6) vezes antes de marcar jogos maiores e confere se as marcas do site batem com as do arquivo.
- Jogo de 7 dezenas (= 7 apostas simples, R$ 42,00): entrou no carrinho normalmente, e o jogo seguinte de 6 dezenas
  também (a quantidade volta a 6 depois do carrinho/limpar).
- Limites do site: 6 a 20 dezenas por jogo; limite diário de apostas R$ 9.300,00.

## Avisos (modais) do site vistos em 24/10/2026

| Aviso | Quando | O que a extensão faz |
|---|---|---|
|  "Atenção! Concurso NNNN ainda não aberto para aposta. Tente novamente mais tarde." (Loteca depois do encerramento) | ao abrir/usar a página da modalidade fechada; as dezenas/palpites não marcam | para tudo e repassa a mensagem do site |
|  "É preciso palpitar em todos os jogos..." | volante da Loteca fora dos limites | recusa o jogo e segue (ver ) |
|  "Existe uma aposta idêntica à que está sendo incluída em seu carrinho. Deseja prosseguir com a inclusão?" (botões Confirmar/Cancelar:  / ) | jogo igual a um que já está no carrinho | **Cancelar** (nunca confirma sozinha), anota como recusado: "o carrinho já tem uma aposta idêntica (não repeti)" |

Se um aviso do site já estiver aberto quando a extensão começa, ela para antes de mexer em qualquer coisa. Se um aviso aparecer
depois do clique em "Colocar no Carrinho", o contador  decide se o jogo entrou (um aviso sem relação não reprova
o jogo; o contador também evita contar duas vezes).

## Pontos a verificar ainda

- Jogos de 8 a 20 dezenas no carrinho e o aviso do site para limites (combinações caras, limite diário).
- Teimosinha e Surpresinha (a extensão não usa).
