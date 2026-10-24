# Extensão Chrome — Lotecando → Loterias Online da Caixa

Extensão do Chrome (Manifest V3) que lê os jogos gerados pelo Lotecando (arquivo `.vol`) e os
inscreve automaticamente no site de Loterias Online da Caixa (https://www.loteriasonline.caixa.gov.br/),
preenchendo o volante da Loteca e colocando cada aposta no carrinho.

## Regras do projeto

- Commits em português. O assunto começa com a tag da ferramenta: `[Claude] ` ou `[Codex] `.
  Exemplo: `[Claude] Adiciona leitura do arquivo .vol`.
- Não commitar sem o usuário pedir. Repositório git local na branch `main`.
- O `description` do manifest tem limite de 132 caracteres (a loja recusa acima); o aviso completo fica no popup e no README.
- Nome da extensão: **Lotecando**; nome exibido: "Lotecando para Loterias Caixa" (escolha do Leonardo, 24/10/2026: deixa claro que é o Lotecando; não usar "Caixa" como
  se fosse extensão oficial). Repositório público no GitHub: `Lotecando-Extensao-Chrome`.
- Licença do projeto: MIT (arquivo `LICENSE`).
- Não copiar código do INJOLOCA (GPL-3.0): ele é só referência; a implementação é própria.
- Código e comentários em português, no estilo simples da extensão de referência.
- A extensão **nunca finaliza a compra/pagamento**: só preenche o volante e põe no carrinho.
  O usuário confere e paga manualmente.
- **Aviso legal obrigatório** (pedido do Leonardo): o autor não tem nenhuma responsabilidade pelos efeitos do
  uso; a responsabilidade é inteiramente de quem usa. Deve estar sempre visível:
  - `README.md` (seção "AVISO LEGAL" no topo — não remover nem enfraquecer);
  - no popup da extensão, de forma clara, com aceite do usuário antes do primeiro uso (guardar o aceite);
  - na descrição do `manifest.json` e da loja;
  - num comentário de cabeçalho em cada arquivo de código (JS/HTML) — texto curto: "Sem garantia. Uso por conta
    e risco do usuário; o autor não se responsabiliza pelos efeitos do uso. Projeto não oficial, sem vínculo com a Caixa."
- **Layout = o do site Lotecando** (pedido do Leonardo, 24/10/2026). Fonte: `D:\Leonardo\Lotecando\WEB`
  (`api/src/publico/padrao/base.css` e `docs/PADROES-INTERFACE.md`). `src/popup.css` copia os tokens (`--verde`,
  `--papel`, `--superficie`, `--tinta`…) e os componentes (`.cartao`, `.campo`, `.dica`, `.btn`, `.btn-2`, `.aviso`
  `.bom`/`.ruim`, `.progresso-arquivo`) com os mesmos nomes; tema escuro pelo `prefers-color-scheme`. Antes de criar
  tela/componente novo, ler o guia e reutilizar o equivalente do site; padrão novo se decide com o Leonardo. Textbox
  em `.campo` declara `type="text"` (sem `type=number`).
- Documentação detalhada em `docs/` (ler antes de mexer):
  - `docs/formato-vol.md` — formato do arquivo `.vol` e mapeamento para o site.
  - `docs/loja/` — publicação na Chrome Web Store: textos da ficha, passo a passo, pontos para o advogado e capturas;
    a política de privacidade fica em `PRIVACIDADE.md` (raiz); `node scripts/empacotar.mjs` gera o .zip em `dist/`.
  - `docs/site-caixa-mega-sena.md` — idem para a Mega-Sena (24/10/2026).
  - `docs/site-caixa-loteca.md` — seletores confirmados no site da Caixa (24/10/2026) e pendências.
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

- Modalidades: **Loteca** (`.vol` do Lotecando 3.0) e **Mega-Sena** (`.txt`, um jogo por linha, dezenas de 2 dígitos; ver
  `docs/site-caixa-mega-sena.md`). Uma extensão só, com um bloco por modalidade em `src/conteudo.js` (`MODALIDADES`) e
  em `src/popup.js`; a modalidade vem da URL da aba da Caixa (`#/loteca`, `#/mega-sena`). Para incluir outra (Quina,
  Lotofácil…): parser em `src/<modalidade>.js` + testes, entrada em `MODALIDADES` nos dois arquivos e doc do site.
- Diferente do INJOLOCA, o usuário carrega o arquivo `.vol` direto (seletor de arquivo / arrastar),
  em vez de colar texto.

## Notas

- O site da Caixa muda com frequência; seletores do DOM (ids `limparvolante`, `colocarnocarrinho`,
  classe `a.loteca_palpite`) devem ficar isolados num único módulo para facilitar ajustes.
- Ordem dos links `a.loteca_palpite` = `jogo * 3 + coluna` (0=1, 1=X, 2=2) — confirmada no site em 24/10/2026.
- Versão 0.1.0 implementada (24/10/2026). Estrutura:
  - `manifest.json` (MV3; permissões `scripting` e `storage`; só o host do site da Caixa);
  - `src/vol.js` — leitura/validação do `.vol` (módulo ES, com testes em `test/`; `npm test`);
  - `src/conteudo.js` — script injetado na aba; **todos os seletores do site ficam em `SELETORES` no topo**; o laço de
    preenchimento roda na página (sobrevive ao fechamento do popup) e expõe `window.lotecando` (`iniciar`, `cancelar`,
    `estado`); para no primeiro erro, confere marcas e valor (preço por aposta) antes de ir ao carrinho;
  - `src/popup.*` — aviso legal com aceite (`VERSAO_DO_AVISO`), seleção do arquivo, resumo, início, progresso, cancelar.
- Testado no site real em 24/10/2026, com a extensão carregada no Chrome de teste (popup → página da Loteca): arquivo
  com 3 linhas válidas + 1 inválida (a inválida foi avisada e ignorada), 3 volantes entraram no carrinho e a mensagem
  final apareceu; um segundo teste cancelou no meio (1 volante já no carrinho, mensagem correta). O carrinho foi
  esvaziado ao fim de cada teste. Volume: 20 volantes (46 apostas) em ~19 s com a aba da Caixa visível; o contador do
  carrinho do site mostrou 20 e voltou a 0 na limpeza. Os 334 volantes do `Exemplo.vol` inteiro e as recusas do site
  (sem duplo, 14 triplos) também foram testados (ver abaixo). Limites de duplos/triplos mapeados (2 a 864 apostas).
- **Aba oculta** (24/10/2026): o Chrome atrasa os `setTimeout` de abas ocultas (1 s, e bem pior depois de 5 min); com
  esperas por `setTimeout`, 12 volantes levaram ~200 s com a aba da Caixa atrás de outra. Por isso `conteudo.js` espera
  por `MutationObserver` e `MessageChannel` (sem pausas fixas); `setTimeout` só como limite de segurança. Resultado com
  a aba oculta: 20 volantes em ~8 s, 50 em ~26 s, 100 em ~88 s e o `Exemplo.vol` inteiro (334 volantes, 830 apostas,
  R$ 1.660) em ~645 s, com o contador do site em 334 e carrinho esvaziado depois. O tempo cresce mais que o linear
  (o site fica mais lento com o carrinho cheio). Arquivos grandes são comuns (Leonardo), então não reintroduzir
  esperas por tempo fixo.
- **Cada volante é confirmado pelo contador do carrinho do site** (`#carrinho`, 1 por volante): o preenchimento só
  segue quando o contador sobe; se não subir em 8 s, para com erro na linha. Motivo: num teste de 100 o contador mostrou
  99 e o critério anterior (volante limpo) não pegava item perdido; depois da mudança, 100 de 100 e 50 de 50.
- O `.vol` gerado pelo Lotecando já respeita os limites de 2 a 864 apostas (confirmado pelo Leonardo, 24/10/2026); a
  checagem da extensão é só uma rede de proteção para arquivos editados à mão ou de outra origem.
- **Volantes recusados não interrompem o lote** (24/10/2026): se o site recusa um volante (modal `#alert`, valor
  diferente do esperado ou nenhuma reação), a extensão fecha o aviso, limpa o volante, registra `{numero, mensagem}` em
  `recusados` e segue; o popup lista as linhas recusadas no fim, agrupadas por mensagem. Só erros inesperados (contador
  do carrinho que não sobe, página errada) param tudo, e 5 recusas seguidas também (sinal de problema geral, ex.: sessão
  expirada). O popup ignora de antemão os volantes fora de **2 a 864 apostas** (`foraDoLimite` em `src/vol.js`; regra
  mapeada com a tabela oficial e no site, ver `docs/site-caixa-loteca.md`; 3 triplos e 5 duplos = 864 é o máximo).
  O preço por aposta só é aprendido de um volante **aceito** (aprender de um recusado causou recusa de volantes válidos).
- **Avisos do site** (24/10/2026; ver `docs/site-caixa-mega-sena.md`): modal já aberto no início → para antes de agir; aviso ao
  marcar (ex.: concurso fechado) → para tudo e repassa a mensagem; pergunta de aposta idêntica → responde **Cancelar** e
  anota como recusado (a extensão nunca confirma duplicar aposta); aviso depois do carrinho → o contador `#carrinho`
  decide se o jogo entrou. Antes dessa regra, um aviso sem relação fez um jogo contar como recusado já tendo entrado.
- O script injetado vive no mundo isolado da extensão: o console da página não enxerga `window.lotecando`;
  consultar/cancelar via `chrome.scripting.executeScript` a partir de uma página da extensão. Em testes por CDP,
  abrir a aba do popup com `Target.createTarget {background: true}` (ou não, para testar aba oculta de propósito) e
  trazer a aba da Caixa para a frente (`Target.activateTarget`) antes de esvaziar o carrinho, que é lento oculta.
- Teste no Chrome: o navegador do Claude (extensão Claude in Chrome) bloqueia `chrome://`, então não instala extensões.
  Use `node scripts/abrir-chrome-teste.mjs`: abre um Chrome **separado** (perfil fixo `.perfil-teste/`, fora do Git,
  porta de depuração 9333) com a extensão carregada via CDP (`Extensions.loadUnpacked`) na página da Loteca. O login na
  Caixa é feito à mão pelo Leonardo, uma vez; nunca digitar credenciais. Ao testar o preenchimento, remover do carrinho
  o que foi colocado (lixeira `a.data-remover_aposta_carrinho_resumido`) e nunca ir ao pagamento.
- **Primeiro uso real (24/10/2026)**: bolão do concurso 1277, 400 volantes de um duplo (800 apostas, R$ 1.600,00)
  colocados no carrinho em 7 min 17 s, contador do site = 400; o Leonardo pagou e confirmou "registrado com sucesso".
  O arquivo real fica em `D:\Leonardo\Lotecando\WEB\dados\arquivos\BolaoLotecando1277.vol` (dado do bolão: não copiar
  para este repositório público). A primeira versão desse arquivo tinha 800 volantes de uma aposta (jogos simples), que a
  Loteca online não aceita. O Leonardo corrigiu o arquivo na origem com o botão **"Aposta mínima" do Lotecando**, que
  completa o duplo mínimo escolhendo um jogo (aqui, a coluna X do jogo 9): no arquivo final, 300 volantes têm o jogo 9
  em `6` (1+X, acréscimo do botão) e 100 já tinham duplo próprio (jogo 9 em `4`) — ou seja, a extensão **não** precisa
  juntar jogos simples: o Lotecando já resolve isso. (Uma junção minha, em pares que diferem em um só jogo, cobria as
  mesmas 800 apostas do arquivo antigo, mas não foi a usada; ficou só em teste.)
- **Segundo uso real (24/10/2026)**: bolão da Mega-Sena, concurso 3074, `mega-sena-3074.txt` (125 jogos de 6 dezenas,
  R$ 750,00) colocado no carrinho em 35 s, contador e total do site conferidos; o Leonardo pagou e confirmou "jogo
  efetivado". O arquivo também fica em `D:\Leonardo\Lotecando\WEB\dados\arquivos` (fora deste repositório).
- Ideias futuras: outras modalidades; empacotar para a Chrome Web Store (revisar o aviso legal e privacidade antes).
- **Publicação na Chrome Web Store** (24/10/2026): versão 1.0.0 enviada para análise pelo Leonardo, visibilidade **Não listada**,
  gratuita, sem revisão de advogado (decisão dele). Código do item na loja: `pmnddbobcjniddofmnnocelpbapihmfm`. O painel não é
  controlável pela extensão Claude in Chrome (bloqueia o domínio da loja): o envio é manual. Lições: o `description` do manifest
  tem limite de 132 caracteres; a conta exige e-mail de contato verificado e pelo menos 1 captura de tela. Se a loja recusar
  (nome com "Caixa", permissões), alternativas de nome em `docs/loja/textos-da-loja.md`; cada reenvio exige `version` maior.
