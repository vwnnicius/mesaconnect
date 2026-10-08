# Colocar o Benservire em prática

## Contas e estabelecimentos

O administrador geral acessa todos os estabelecimentos pelo seletor no topo. Em **Configurações → Estabelecimentos**, cadastra uma unidade e a quantidade inicial de mesas. Em **Equipe**, cria os acessos individuais de administrador local, gerente e garçom.

- Administrador geral: todas as unidades; cadastro de estabelecimentos e equipes. A conta inicial é `vexadmin@mesaconnect.com`. A credencial fica no Supabase Auth e não está no repositório.
- Administrador local: identidade, planta, equipe, relatórios, avaliações e dispositivos da própria unidade; pode cadastrar outros administradores locais.
- Gerente: operação e equipe da própria unidade; não pode alterar administradores nem acessar outras unidades. O formulário de cadastro permite criar garçons.
- Garçom: chamados da unidade e perfil próprio. Vê a fila aguardando e seus atendimentos assumidos. Outro garçom não pode concluir um atendimento que não assumiu.
- Cliente: abre o QR sem criar conta; envia nota e comentário, sem acesso à lista de mesas, chamados ou avaliações.

As permissões são verificadas no banco e no serviço administrativo. Esconder uma aba não é o mecanismo de autorização. Para seu sócio ter histórico individual, cadastre uma conta própria e atribua o acesso geral de forma administrativa; esse papel não é oferecido no cadastro comum da equipe.

## Primeiro restaurante

1. Entre na conta geral e selecione a unidade.
2. Cadastre a equipe e entregue a cada pessoa seu acesso individual.
3. Em **Identidade visual**, envie logo e capa; em **Perfil**, cada pessoa pode trocar nome e foto. Avatares ficam em armazenamento privado, acessados por URLs temporárias.
4. Em **Salão → Personalizar salão**, arraste as mesas, ajuste formato, rotação, lugares e setor e salve. Setas do teclado também movimentam a mesa. A planta é salva por unidade e usa controle de versão para evitar sobrescrever a edição de outra pessoa.
5. Em **Links das mesas**, gere e baixe os QR Codes. Gere o material no endereço de produção para que o QR abra a Vercel, e não um localhost.
6. Use **Demo interativa** para explicar o fluxo sem mexer na operação. O **Simulador** altera as mesas reais da unidade; não misture esse teste com um turno de atendimento.

## Primeiro ESP32

O endpoint HTTPS é `POST https://SEU-DOMINIO/api/device/events`.

1. Em **Configurações → Dispositivos**, pareie uma mesa.
2. Copie a configuração apresentada uma única vez. Cada placa recebe um `device_uid` e um token próprio. Renovar o pareamento invalida o token anterior.
3. Configure na placa a rede Wi-Fi, o endereço HTTPS, o identificador e o token. Não use a chave administrativa do Supabase na placa.
4. Ligue o botão a um GPIO apropriado para sua placa, com entrada pull-up e contato para GND. Confirme o esquema elétrico, alimentação, resistores e GPIO antes de montar o equipamento; o hardware ainda não foi ensaiado.
5. No firmware, aplique debounce de aproximadamente 50 ms e envie um único evento por acionamento. Faça requisições HTTPS com certificado validado, timeout e repetição com espera crescente. Um CALL repetido durante o atendimento devolve o chamado existente.

Cabeçalhos:

```http
Content-Type: application/json
Authorization: Bearer TOKEN_EXCLUSIVO_DA_PLACA
```

Corpo:

```json
{"device_uid":"IDENTIFICADOR_DO_PAREAMENTO","event_type":"CALL"}
```

Eventos aceitos: `CALL`, `DO_NOT_DISTURB`, `RESET` e `HEARTBEAT`. HEARTBEAT atualiza presença e horário da última comunicação. RESET/DO_NOT_DISTURB são recusados enquanto existe atendimento ativo: o garçom precisa concluir o chamado. O domínio de eventos é o mesmo usado pelo simulador autenticado. O servidor bloqueia eventos sem credencial, limita tamanho do corpo e reduz a frequência por dispositivo.

O serviço mantém o hash da credencial em um esquema privado. A placa não precisa criar uma conta de garçom. Os estados CALLING → ACKNOWLEDGED → COMPLETED são gravados com autoria e horário do servidor; o estado da mesa muda na mesma transação.

## O que falta antes de operar com hardware em escala

- Firmware, caixa, alimentação e teste físico do botão/LED. Esta revisão preparou API e pareamento, não um equipamento validado.
- Confirmação de estado para LED, fila local durante queda do Wi-Fi, provisionamento por aplicativo e detecção automática de offline por ausência de heartbeat.
- Limites de abuso/CAPTCHA ou token de sessão para avaliações públicas. A função valida nota, comentário e mesa, mas um QR compartilhado ainda pode receber avaliações repetidas.
- Agregação e paginação de grandes históricos: a tela atual calcula sobre até 1.000 chamados no período e até 1.000 avaliações retornadas pela API. Horários seguem o fuso do dispositivo.
- Recuperação de senha: autorize os endereços `/auth/callback` de produção e desenvolvimento na configuração de redirect URLs do Supabase. O usuário recebe um link; ninguém precisa consultar sua senha.
- A verificação de senhas vazadas está desativada no projeto. Veja a [configuração oficial de segurança de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Identidade visual

As referências foram implementadas diretamente no frontend: fundo quente, verde sóbrio, tipografia de sistema e títulos editoriais na visão geral e login; estados funcionais em verde, âmbar, azul, vermelho e cinza. Não foi utilizado slogan em inglês.

Foto de entrada: `public/images/restaurant-hospitality.png`, criada com a ferramenta integrada imagegen e servida com otimização de imagem do Next.js. Prompt: fotografia editorial realista de restaurante brasileiro contemporâneo, paredes claras, mesas de carvalho, cadeiras verde sálvia, luz natural, vidro e cerâmica, sem pessoas, texto, logos ou interface. A imagem pode ser substituída por uma fotografia real da marca. O Lovable não expôs ações executáveis nesta sessão; o design foi construído no repositório existente.


## Novos acessos e operação

Administrador geral acessa todas as unidades e dispositivos. Proprietário acessa apenas sua unidade e cria gerentes/garçons; gerente cria e redefine senha de garçons; garçom vê fila, mesas, observações, perfil e Tela. O login simples é traduzido internamente para um identificador do Supabase Auth; ninguém precisa informar e-mail pessoal para usar a equipe. Não desative a confirmação ou a validação de papéis no servidor.

Os exemplos Aurora, Brasa & Lenha e Jardim da Mesa são unidades fictícias isoladas, com plantas diferentes e cinco usuários cada. As senhas não estão neste documento. Use o arquivo privado entregue no computador.

Em Configurações → Google e QR, adicione o link HTTPS oficial de avaliação do estabelecimento. O QR é gerado automaticamente após salvar. O cliente pode avaliar no Google independentemente da nota dada no Benservire. Não use link inventado para empresas fictícias.

Em Desempenho, selecione mês ou histórico completo e um funcionário. Ranking mede resposta operacional, não determina sozinho qualidade do trabalho. Avaliação genérica da mesa não é atribuída artificialmente a um funcionário.

A Tela destaca chamados, prioridade definida pela gestão e espera acima de cinco minutos. Som só funciona após ativação explícita. Dispositivo sem comunicação recente (90 segundos) recebe aviso; isso não apaga chamados ativos.

Firmware e instalação: [guia do ESP32](../firmware/mesaconnect-esp32/README.md). Wi-Fi clássico de 2,4 GHz, HTTPS com certificado válido, token próprio e heartbeat de 30 segundos. Não colocar credenciais no Git. O ensaio com placa física continua necessário antes da operação real.

Evoluções sugeridas: atribuição por turno/setor, notificações PWA, fila persistente no dispositivo, monitoramento de bateria e QR por sessão para reduzir abuso e associar feedback ao atendimento correto.
