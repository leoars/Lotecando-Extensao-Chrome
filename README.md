# Lotecando – Loterias Caixa (extensão do Chrome)

Extensão do Chrome que lê os jogos da Loteca gerados pelo programa **Lotecando** (arquivo `.vol`) e os
preenche no site de Loterias Online da Caixa, colocando cada aposta no carrinho para você conferir e pagar.

> Status: versão 0.1.0, em desenvolvimento. Suporta a **Loteca** (`.vol`) e a **Mega-Sena** (`.txt`).

## ⚠️ AVISO LEGAL — LEIA ANTES DE USAR

**Esta extensão é fornecida "como está" (*as is*), sem garantia de qualquer tipo.**

- O autor **não tem nenhuma responsabilidade** pelos efeitos do uso desta extensão, incluindo, sem se limitar a:
  apostas preenchidas incorretamente, apostas duplicadas, omitidas ou não registradas, valores cobrados,
  prejuízos financeiros, prêmios não recebidos, bloqueio ou suspensão de conta, falhas do site ou perda de dados.
- **O uso é de responsabilidade inteira e exclusiva de quem a utiliza.** Você é quem decide instalar, executar e
  pagar as apostas.
- **Confira sempre** cada aposta no carrinho do site da Caixa **antes de pagar**. A extensão nunca finaliza a
  compra nem o pagamento.
- Esta extensão é um projeto **independente e não oficial**. Não tem vínculo, aprovação ou apoio da Caixa Econômica
  Federal. "Caixa" e "Loterias Online" pertencem aos seus respectivos titulares.
- O site da Caixa pode mudar a qualquer momento e fazer a extensão parar de funcionar ou funcionar de forma
  incorreta. Verifique se o uso da automação é compatível com os termos de uso do site.
- Jogar em loterias envolve risco financeiro e é permitido apenas a maiores de 18 anos.

Ao instalar ou usar a extensão, você declara que leu e aceitou este aviso. Veja também a [licença MIT](LICENSE),
que contém a isenção formal de garantia e responsabilidade.

## Como instalar (modo desenvolvedor)

1. Baixe ou clone este repositório.
2. No Chrome, abra `chrome://extensions` e ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e escolha a pasta do projeto (a que contém o `manifest.json`).

## Como usar

1. Entre na sua conta em https://www.loteriasonline.caixa.gov.br/ e abra a página da **Loteca** ou da **Mega-Sena**.
2. Clique no ícone da extensão, leia e aceite o aviso legal (só na primeira vez).
3. Escolha o arquivo gerado pelo Lotecando (`.vol` da Loteca ou `.txt` da Mega-Sena) e confira o resumo.
4. Clique em **Preencher e colocar no carrinho**. A extensão marca cada volante e o coloca no carrinho; pode fechar
   o popup, o trabalho continua na página. Ela para no primeiro problema e diz em que linha do arquivo parou.
5. **Confira o carrinho no site e pague você mesmo.**

## Desenvolvimento

`npm test` roda os testes da leitura do `.vol`. Notas para quem desenvolve (Claude, Codex ou pessoas) em
[AGENTS.md](AGENTS.md).

## Formato `.vol`

Veja [docs/formato-vol.md](docs/formato-vol.md). Exemplo em [exemplos/Exemplo.vol](exemplos/Exemplo.vol).

## Licença

[MIT](LICENSE)
