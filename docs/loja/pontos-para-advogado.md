# Pontos para revisão jurídica antes de publicar

Preparado em 24/10/2026. **Não é parecer jurídico**: é um levantamento do que a extensão faz e das cláusulas que
encontrei, para um advogado avaliar antes da publicação na Chrome Web Store (ou de qualquer distribuição a terceiros).
Para uso próprio do autor no navegador dele, o risco é bem menor, mas os pontos 1 a 3 valem igualmente.

## O que a extensão faz (fatos)

- Lê um arquivo local escolhido pelo usuário e, **com o usuário logado e na página da Loteca ou da Mega-Sena**, clica nos
  mesmos botões que o usuário clicaria (dezenas, limpar, "Colocar no Carrinho"), um jogo por vez, e confere o contador e o
  valor do carrinho exibidos na página.
- **Nunca** vai ao pagamento; o usuário confere o carrinho e paga.
- Não lê nem guarda senha, dados cadastrais ou de pagamento; não faz requisições de rede próprias; não coleta dados
  (ver `PRIVACIDADE.md`). Guarda só, no navegador, o aceite do aviso legal.
- Não injeta no site nada além dos cliques; não altera nem copia conteúdo do portal; não faz engenharia reversa (o código
  só usa a estrutura pública da página, que o navegador já recebe).
- Ritmo: cerca de 1 a 3 jogos por segundo (hoje, 400 volantes em ~7 min). Isso é mais rápido que uma pessoa; ver ponto 2.

## 1. Termo de Uso do Portal Loterias Online (Caixa)

Texto lido em 24/10/2026 em `https://www.loteriasonline.caixa.gov.br/silce-web/#/termo-de-uso`. Cláusulas relevantes:

- **7.4** — "É vedado ao usuário: a) Copiar, divulgar, transmitir, tornar disponível, remover ou alterar qualquer material
  disponível no Portal [...]; b) Fazer uso de engenharia reversa ou descompilação de qualquer software utilizado em
  conexão com o Portal [...]". A extensão não copia nem altera material nem faz engenharia reversa, mas **perguntar** se
  automatizar cliques na página configura "alterar" material ou uso indevido.
- **10.1 a)** — o uso do portal e as apostas "são restritas a seu uso pessoal". Para o próprio usuário preencher os
  jogos dele, está dentro. Perguntar se **distribuir** a ferramenta a terceiros muda isso (cada usuário usa a própria conta).
- **10.1 c)** — o usuário se compromete a não transmitir conteúdo "suscetível a causar prejuízo ou dano" aos sistemas da
  Caixa. Avaliar se um ritmo alto de cliques/requisições (centenas de jogos em minutos) pode ser visto como sobrecarga.
- **7.1 b)** e **1.16** — a Caixa pode encerrar, alterar ou suspender o acesso e bloquear contas por violação do Termo ou
  indícios de fraude. **Risco prático para o usuário:** bloqueio da conta por comportamento automatizado. O aviso legal
  já diz isso, mas avaliar se deve ficar mais explícito.
- **10.1 d)** — danos à Caixa por "utilização indevida" "acarretará possíveis sanções judiciais".
- **7.5** — falhas de software que impliquem "não efetivação de aposta ou compra" não são responsabilidade da Caixa.
  Relevante: se a extensão falhar, quem arca é o usuário (e o aviso legal diz que o autor também não responde).
- **1.14** — a senha é pessoal e intransferível. A extensão não manipula senha (usa a sessão já aberta pelo usuário).
- **7.3** — a Caixa detém marcas e direitos de propriedade intelectual das modalidades e do portal (ver ponto 2).

Sugestão: considerar **consultar a Caixa** (canal de atendimento ao empresário/usuário de loterias) sobre a posição
oficial quanto a ferramentas de preenchimento automático antes de divulgar amplamente.

## 2. Nome e marcas ("Caixa", "Loterias Online", "Mega-Sena", "Loteca")

- O nome atual, "Lotecando para Loterias Caixa", contém a marca **Caixa**; a forma "Lotecando para…" foi escolhida para deixar
  claro que o produto é do Lotecando e não da Caixa. A Chrome Web Store proíbe extensões que se passem
  por terceiros ou sugiram endosso; "Caixa" no nome ainda pode motivar reprovação. Alternativas sem a marca no nome:
  "Lotecando – Apostas Online", "Lotecando para Loterias Online". Mega-Sena e Loteca são nomes das modalidades (também
  da Caixa); descrever a função ("para Loteca e Mega-Sena") na descrição costuma ser tolerado como uso descritivo, mas
  avaliar.
- O ícone é o logotipo do **Lotecando** (marca do próprio autor); nenhum logotipo da Caixa é usado.
- O aviso "não oficial, sem vínculo com a Caixa" aparece no popup, no README, na descrição e na ficha da loja.

## 3. Aviso legal e responsabilidade

- O aviso legal (README e popup, com aceite e confirmação de maioridade) isenta o autor dos efeitos do uso. Avaliar:
  validade de cláusula de isenção total diante do **Código de Defesa do Consumidor** se a ferramenta for distribuída
  gratuitamente ou, principalmente, se algum dia for cobrada; limites da exclusão de responsabilidade por falhas que
  causem prejuízo financeiro (apostas duplicadas, etc.).
- A licença é MIT (código aberto, "como está"). Verificar compatibilidade com o modelo pretendido (gratuito, pago?).
- A extensão não promove nem incentiva apostas; avaliar se a ficha da loja ou o site Lotecando precisam de aviso de
  jogo responsável e se há regras sobre **publicidade de apostas** aplicáveis a quem divulga a ferramenta.

## 4. Privacidade (LGPD) e políticas da loja

- A extensão não coleta dados pessoais; a política (`PRIVACIDADE.md`) diz isso e lista permissões. Avaliar se a redação
  basta para LGPD e para o formulário de "Práticas de privacidade" da loja (nenhuma categoria de dados marcada).
- Confirmar a hospedagem da política: hoje é um arquivo no GitHub público; a loja aceita qualquer URL pública estável.
- A loja exige, para contas de desenvolvedor, declarar se é **comerciante (trader)**, com dados de contato exibidos
  publicamente para comerciantes. Decidir como se declarar; isso afeta a exposição de dados pessoais do autor.

## 5. Perguntas objetivas ao advogado

1. Distribuir uma extensão que automatiza cliques no Portal Loterias Online, usada pelo próprio apostador logado, viola o
   Termo de Uso (7.4, 10.1)? E, se violar, qual a exposição do autor (e dos usuários)?
2. O texto do aviso legal protege o autor de forma suficiente, e deve haver termo de uso próprio da extensão?
3. O nome pode conter "Caixa"? Qual formulação descritiva é segura?
4. Convém pedir autorização ou ao menos manifestação da Caixa antes de publicar?
5. Há algum registro ou obrigação específica por a ferramenta ser usada com apostas de loteria (regulação de apostas,
   publicidade, jogo responsável)?
