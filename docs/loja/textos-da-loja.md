# Textos para a ficha da Chrome Web Store

Tudo aqui é para copiar e colar no painel do desenvolvedor (https://chrome.google.com/webstore/devconsole). Idioma
principal: português (Brasil). Os limites são os da loja.

## Nome (máx. 75 caracteres)

`Lotecando – Loterias Caixa`

> Atenção: o nome tem a marca "Caixa". A loja pode recusar nomes que sugiram ligação oficial com terceiros. Alternativa
> mais segura, se isso acontecer: `Lotecando – Apostas Online` ou `Lotecando para Loterias Online`. Ver
> `pontos-para-advogado.md`. O `manifest.json` precisa ter o mesmo nome publicado.

## Resumo (máx. 132 caracteres)

`Preenche o volante e coloca no carrinho os jogos da Loteca (.vol) e da Mega-Sena (.txt) gerados pelo Lotecando. Não oficial.`

(125 caracteres.)

## Categoria

Produtividade (ou "Ferramentas"). Idioma: Português (Brasil).

## Descrição detalhada

```
Lotecando – Loterias Caixa preenche, no site de Loterias Online da Caixa, os jogos que você gerou no programa Lotecando.

Escolha o arquivo do Lotecando (.vol da Loteca ou .txt da Mega-Sena), confira o resumo, e a extensão marca cada jogo no
volante e o coloca no carrinho, um por vez. Você confere o carrinho e paga no próprio site. A extensão NUNCA faz o pagamento.

O QUE ELA FAZ
• Loteca: lê o arquivo .vol (14 jogos por linha, com duplos e triplos) e preenche os volantes, respeitando os limites da
  Loteca (de 2 a 864 apostas por volante).
• Mega-Sena: lê o arquivo .txt (um jogo por linha, de 6 a 20 dezenas) e preenche os jogos.
• Confirma cada jogo pelo contador do carrinho do site e para se algo não bater, dizendo em qual linha do arquivo parou.
• Se o site recusar algum jogo, pula, anota e segue; no fim lista as linhas recusadas.
• Funciona com a aba em segundo plano e permite cancelar a qualquer momento.
• Lotes grandes: centenas de jogos em poucos minutos.

COMO USAR
1. Entre na sua conta no site de Loterias Online da Caixa e abra a página da Loteca ou da Mega-Sena.
2. Clique no ícone da extensão e leia o aviso legal (só na primeira vez).
3. Escolha o arquivo gerado pelo Lotecando e confira o resumo.
4. Clique em "Preencher e colocar no carrinho".
5. Confira o carrinho e pague no site da Caixa.

PRIVACIDADE
Não coleta, não envia e não compartilha nenhum dado. Não lê senhas nem dados de pagamento. Só funciona na página da
Loteca e da Mega-Sena do site da Caixa. Política completa: https://github.com/leoars/Lotecando-Extensao-Chrome/blob/main/PRIVACIDADE.md

AVISO IMPORTANTE
Projeto independente e NÃO OFICIAL, sem vínculo com a Caixa Econômica Federal. Fornecido "como está", sem garantia; o autor
não se responsabiliza pelos efeitos do uso, que é inteiramente de quem o faz. Confira sempre o carrinho antes de pagar. O
site da Caixa pode mudar a qualquer momento e afetar o funcionamento. Jogar envolve risco financeiro e é permitido apenas a
maiores de 18 anos.

Código aberto (licença MIT): https://github.com/leoars/Lotecando-Extensao-Chrome
```

## Finalidade única (campo "Single purpose")

```
Preencher no site de Loterias Online da Caixa, a partir de um arquivo escolhido pelo usuário, os jogos da Loteca e da
Mega-Sena gerados pelo programa Lotecando e colocá-los no carrinho de compras do usuário, sem finalizar a compra.
```

## Justificativa das permissões (aba "Práticas de privacidade")

**Permissão de host: `https://www.loteriasonline.caixa.gov.br/*`**
```
Necessária para marcar as dezenas do volante e clicar em "Colocar no Carrinho" na página da Loteca ou da Mega-Sena do site
de Loterias Online da Caixa, que é a única finalidade da extensão. Não é usada em nenhum outro site.
```

**`scripting`**
```
Usada para injetar, na aba aberta do site de Loterias Online da Caixa, o script que preenche os jogos escolhidos pelo
usuário e informa o progresso ao popup. Todo o código está dentro do pacote da extensão; nenhum código remoto é carregado.
```

**`storage`**
```
Usada apenas para guardar, no próprio navegador, que o usuário leu e aceitou o aviso legal (um número de versão), para não
repetir o aviso a cada uso.
```

**Código remoto:** não. A extensão não carrega nem executa código de fora do pacote.

## Declarações de dados (aba "Práticas de privacidade")

- Coleta de dados do usuário: **nenhum** tipo de dado marcado (nenhuma das categorias: informações pessoais,
  financeiras, autenticação, saúde, comunicações, localização, histórico, atividade do usuário, conteúdo do site).
  > Observação: a extensão interage com a página da Caixa e lê o contador e o valor do carrinho, mas não coleta nem guarda
  > esse conteúdo; ele fica só na memória da aba. Se o formulário da loja questionar "conteúdo do site", responder que
  > não é coletado nem transmitido.
- Marcar as três certificações: os dados não são vendidos a terceiros; não são usados para fins alheios à finalidade
  única; não são usados para avaliar crédito.
- URL da política de privacidade:
  `https://github.com/leoars/Lotecando-Extensao-Chrome/blob/main/PRIVACIDADE.md`

## Outros campos

- URL da página inicial: `https://github.com/leoars/Lotecando-Extensao-Chrome`
- URL de suporte: `https://github.com/leoars/Lotecando-Extensao-Chrome/issues`
- Visibilidade sugerida para começar: **Não listada** (só quem tiver o link instala), depois decidir por Pública.
- Imagens: ícone 128×128 (já em `icons/icon128.png`), capturas de tela 1280×800 em `docs/loja/capturas/` e, opcional,
  bloco promocional 440×280 (não gerado).
