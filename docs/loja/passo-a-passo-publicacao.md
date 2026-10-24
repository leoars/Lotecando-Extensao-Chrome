# Passo a passo para publicar na Chrome Web Store

Fica com o Leonardo: o cadastro, a taxa e o envio são feitos por ele, na conta dele. O que está pronto neste repositório:
política de privacidade (`PRIVACIDADE.md`), textos da ficha (`textos-da-loja.md`), capturas de tela (`capturas/`), pacote
(`node scripts/empacotar.mjs` gera `dist/lotecando-<versão>.zip`) e pontos para o advogado (`pontos-para-advogado.md`).

## Antes de enviar

1. **Decidir o nome.** "Lotecando – Loterias Caixa" tem a marca Caixa; ver `pontos-para-advogado.md` (ponto 2). Se mudar, alterar
   `name`, `short_name` e `action.default_title` no `manifest.json`, o título do `popup.html` e os textos da loja, e
   regerar o pacote.
2. **Revisão jurídica** (ver `pontos-para-advogado.md`), principalmente o Termo de Uso da Caixa (cláusulas 7.4 e 10.1).
3. **Versão.** O `manifest.json` está em `0.1.0`. Para a primeira publicação, sugiro `1.0.0`; cada novo envio exige uma versão
   maior que a anterior.
4. Rodar `npm test` e testar a extensão carregada (ver README).

## Conta de desenvolvedor

1. Entrar em https://chrome.google.com/webstore/devconsole com a conta Google que será a dona da extensão.
2. Pagar a **taxa única de cadastro** (US$ 5) e ativar a verificação em duas etapas, que a loja exige.
3. Informar o e-mail de contato e declarar o **status de comerciante** (trader / não comerciante). Atenção: para comerciantes,
   alguns dados de contato ficam públicos. Pode-se pedir orientação ao advogado.

## Envio

1. `node scripts/empacotar.mjs` → pega o arquivo em `dist/`.
2. No painel: **Novo item** → enviar o `.zip`.
3. Preencher a ficha com os textos de `textos-da-loja.md` (nome, resumo, descrição, categoria, idioma, finalidade única,
   justificativa de permissões, URL da política de privacidade, declarações de dados).
4. Enviar as imagens: ícone (`icons/icon128.png`) e as capturas de `docs/loja/capturas/` (1280×800).
5. Visibilidade: começar **Não listada** (só quem tem o link instala) e só depois, se fizer sentido, tornar pública.
6. **Enviar para análise.** O prazo costuma ser de alguns dias; extensões com permissão de host podem ter revisão mais
   demorada. A loja pode pedir esclarecimentos sobre a marca "Caixa" ou sobre o uso das permissões.

## Depois de publicada

- Quem instalar pela loja recebe atualizações automáticas; ao publicar nova versão, aumentar `version` no `manifest.json`.
- O aviso "extensões do modo de desenvolvedor" some no Chrome do Leonardo se ele trocar a versão carregada pela da loja
  (remover a carregada sem compactação antes de instalar a da loja, para não duplicar).
- Quando a Caixa mudar o site e algo parar de funcionar, ajustar `SELETORES` e `MODALIDADES` em `src/conteudo.js`
  (documentado em `docs/site-caixa-*.md`), subir a versão e reenviar.
