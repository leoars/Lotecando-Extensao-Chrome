# Política de Privacidade — Lotecando para Loterias Caixa

Última atualização: 24 de outubro de 2026.

**Em uma frase: a extensão não coleta, não envia e não compartilha nenhum dado seu.**

## O que a extensão faz

A extensão **Lotecando para Loterias Caixa** lê um arquivo de jogos que você mesmo escolhe (o `.vol` da Loteca ou o `.txt`
da Mega-Sena, gerados pelo programa Lotecando) e, na página da Loteca ou da Mega-Sena do site de Loterias Online da Caixa
(`https://www.loteriasonline.caixa.gov.br/`), marca os números e clica em "Colocar no Carrinho", um jogo por vez. Ela nunca
vai ao pagamento: você confere o carrinho e paga por conta própria.

## Dados que a extensão coleta

**Nenhum.** A extensão não tem servidor, não usa serviços de análise, publicidade ou rastreamento, não cria contas e não faz
nenhuma requisição de rede por conta própria.

## Dados que a extensão processa no seu navegador

- **O arquivo de jogos** que você escolhe: é lido apenas na memória do seu navegador para montar as apostas na página da
  Caixa. Não é gravado, copiado nem enviado a lugar nenhum pela extensão.
- **A página da Caixa aberta na aba:** a extensão só interage com os botões do volante, do carrinho e com os avisos do site
  (clicar em dezenas, limpar o volante, colocar no carrinho, fechar um aviso) e lê o contador e o valor do carrinho para
  conferir cada jogo. Ela **não lê nem guarda senhas, dados de cadastro, cartão ou dados de pagamento**.
- Quando a extensão clica em "Colocar no Carrinho", os jogos seguem do seu navegador para a Caixa como se você os tivesse
  feito à mão. O tratamento desses dados pela Caixa segue a política de privacidade da Caixa, não esta.

## Dados guardados no seu navegador

A extensão guarda **uma única informação**, localmente (`chrome.storage.local`): que você leu e aceitou o aviso legal (a
versão do aviso aceito). Isso serve só para não repetir o aviso toda vez. Ela fica no seu computador e é apagada se você
remover a extensão.

## Permissões que a extensão pede

| Permissão | Para que serve |
|---|---|
| Acesso ao site `loteriasonline.caixa.gov.br` | Marcar as dezenas e colocar os jogos no carrinho, só nessa página. A extensão não funciona em nenhum outro site. |
| `scripting` | Executar na aba da Caixa o código que preenche os jogos. |
| `storage` | Lembrar que o aviso legal foi aceito. |

## Compartilhamento com terceiros

Nenhum. Nada é vendido, alugado, transferido ou divulgado a terceiros, porque nada é coletado.

## Crianças e adolescentes

O uso de loterias é permitido apenas a maiores de 18 anos, e a extensão pede essa confirmação no aviso legal. Ela não é
destinada a menores.

## Seus direitos (LGPD)

Como a extensão não coleta nem trata dados pessoais fora do seu próprio navegador, não há dados em poder do autor para
acessar, corrigir ou excluir. Para apagar o único dado local (o aceite do aviso), remova a extensão do Chrome.

## Mudanças nesta política

Se a extensão mudar a forma de tratar dados, esta política será atualizada antes e a data acima será alterada. As versões
anteriores ficam no histórico do repositório.

## Aviso legal e contato

Projeto independente e **não oficial**, sem vínculo com a Caixa Econômica Federal. Fornecido "como está", sem garantia, e de
uso por conta e risco do usuário; veja o aviso legal completo no [README](README.md) e a [licença MIT](LICENSE).

Dúvidas e solicitações: abra uma *issue* em https://github.com/leoars/Lotecando-Extensao-Chrome/issues.
