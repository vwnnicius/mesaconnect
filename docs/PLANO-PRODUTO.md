# MesaConnect — da demonstração ao piloto

Proposta de produto e implementação, 7 de outubro de 2026. Este documento descreve trabalho futuro; não representa funcionalidades já implementadas.

## Diagnóstico atual

O painel usa o padrão lateral + indicadores + caixas + gráficos. A fila e o mapa são úteis, mas disputam atenção com métricas de demonstração. O salão é uma grade numérica sem posição física. O produto ainda não possui gestão operacional completa de equipe, turnos, setores e dispositivos. O restaurante de demonstração permanece fixado em partes da camada de dados. A auditoria do repositório identifica políticas RLS permissivas e uma API de dispositivos sem credencial individual. Esses pontos precisam ser resolvidos antes de dados reais de vários restaurantes.

## Contas e estabelecimentos

Uma plataforma MesaConnect atende vários estabelecimentos. Cada pessoa tem sua própria conta Supabase Auth; o estabelecimento é uma organização, não uma senha compartilhada. Uma associação determina onde a pessoa trabalha e seu papel.

| Papel | Acesso proposto |
| --- | --- |
| Administrador da plataforma | Cadastro e situação dos estabelecimentos; acesso operacional excepcional deve ser explícito e auditado |
| Proprietário | Equipe, unidades, configurações e desempenho da própria organização |
| Gerente | Operação, setores, turnos, equipamentos e relatórios da unidade permitida |
| Garçom | Fila e mesas permitidas, assumir/concluir chamados e próprio histórico |
| Cliente | Chamar/avaliar via acesso público limitado; sem conta da equipe |
| Dispositivo | Credencial própria revogável; nunca uma conta de garçom |

Fluxo inicial: operador cadastra restaurante e proprietário; proprietário entra, configura mesas/setores, convida gerente e garçons; cada funcionário define sua senha. Ao desligar um funcionário, revogar sua associação. A desativação deve bloquear novas operações mesmo com uma sessão existente. O gerente nunca precisa conhecer as senhas pessoais.

Modelo sugerido: organizations, restaurants (unidades), memberships (user_id, restaurant_id, role, active), tables, sectors, shifts, shift_assignments, service_calls, devices, device_events, evaluations e audit_events. Na primeira entrega, uma organização pode ter apenas uma unidade; a estrutura permite expansão sem exigir agora uma interface de redes/franquias.

Supabase Auth identifica a pessoa. RLS verifica associação ativa e unidade em cada leitura/escrita. Filtro no frontend não é isolamento. Não aceitar papel ou unidade enviados pelo cliente como autorização. Convites e provisionamento são operações de servidor, com a credencial administrativa somente no servidor. Inserção/edição da própria associação não pode permitir promoção de papel.

Testes essenciais: pessoa do restaurante A não lê, altera nem recebe dados do B; garçom não convida gerente nem promove seu papel; associação desativada perde acesso; usuário anônimo não consulta equipe, chamados ou dispositivos. Aplicar as mesmas restrições às assinaturas Realtime.

## Operação do salão

Garçom abre diretamente a fila no celular. Vê setor atribuído, mesas esperando, atendimentos assumidos e estado da conexão. Um toque em “Estou indo” assume o chamado; outro em “Concluir” encerra. Separar tempo até assumir do tempo até concluir: assumir o chamado não prova que o garçom chegou fisicamente à mesa.

Inicialmente, fila compartilhada por setor com atribuição voluntária. Se dois garçons assumirem ao mesmo tempo, somente um vence e o outro recebe o estado atualizado. Gerente pode reassociar chamado com motivo registrado. Depois, oferecer escala por mesa/setor quando houver necessidade real.

Regras de banco: no máximo um chamado ativo por mesa; CALLING → ACKNOWLEDGED → COMPLETED; transições e estado da mesa alterados numa transação; identidade do atendente validada no servidor. Cancelamento e “não incomodar” exigem regra explícita para o chamado ativo. Não declarar COMPLETED automaticamente para esconder uma inconsistência.

## Nova interface

Garçom: três destinos — Fila, Salão, Meu turno. Hierarquia centrada no número da mesa, tempo e próxima ação. Se houver espera, primeiro item destacado; demais em lista com divisores. Ações de pelo menos 48 px e espaço suficiente para uso com uma mão. Simulador fica na área de configuração/teste.

Gerente: salão como elemento principal, lista de atenção ao lado e resumo real do turno abaixo. Mapa deve preservar posição física cadastrada pelo gerente. Até existir editor/posições reais, apresentar a grade como lista de mesas, sem fingir uma planta.

Identidade: fundo claro quente, texto grafite, azul profundo usado só para ação/seleção, tipografia bem escalonada, bordas discretas, quase nenhuma sombra. Estado urgente usa texto e marcador; não depender só de cor. Modo escuro desenhado separadamente. Sem gradientes decorativos, números inventados, animações contínuas ou caixas para cada pequeno item.

Recursos que tornam a operação útil: gestão de equipe, setores e turnos; tempo limite configurável; responsável visível; histórico de transições; situação real de conexão; pareamento/revogação de botão; QR imprimível por mesa; indicadores baseados em dados reais. Adiar estoque, comandas e pagamentos até validar o atendimento.

## Hardware e comunicação

Piloto sugerido: um ESP32 com Wi-Fi 2,4 GHz, botão momentâneo, indicador LED e alimentação USB. Confirmar modelo da placa e tipo de LED antes de definir pinagem/resistores. Não fornecer tensão de alimentação do módulo USB diretamente aos GPIOs. Bateria, caixa final, PCB e produção em volume vêm depois da validação em bancada e no restaurante.

Provisionamento: gerente cria dispositivo, associa à mesa e recebe credencial individual uma única vez; firmware armazena Wi-Fi, endpoint e credencial; servidor mantém hash da credencial e permite revogar/rotacionar. UID sozinho não autentica. Nunca gravar chave administrativa do Supabase no ESP32.

Fluxo proposto:

1. Botão gera event_id único e indica “enviando”.
2. ESP32 envia HTTPS para POST /api/device/events com credencial, event_id, tipo e versão do firmware. Verificar certificado TLS.
3. Servidor resolve restaurante/mesa pela credencial, valida e limita frequência. Ignorar tenant/table fornecidos pelo dispositivo como autoridade.
4. Transação registra evento e cria/reutiliza chamado ativo. Reenvio do mesmo event_id retorna o resultado anterior.
5. Realtime atualiza os aparelhos autorizados da equipe.
6. Servidor responde com confirmação e estado canônico. LED só indica “registrado” após confirmação.
7. Para refletir ACKNOWLEDGED/COMPLETED no botão, firmware consulta endpoint autenticado de estado em intervalo ajustável. Realtime para o celular não atualiza automaticamente o ESP32. Avaliar MQTT apenas se volume/latência exigirem.

Falhas: debounce para um toque não gerar múltiplos eventos; reenvio com atraso crescente e limite; fila local pequena; eventos pendentes expiram para não criar chamados antigos após longa desconexão. Guardar horário do servidor e separar timestamp do aparelho. Heartbeat e last_seen determinam offline; dispositivo sem Wi-Fi pode sinalizar falha, mas não entrega chamado pela internet. Se o restaurante exigir operação sem internet, será necessário gateway local e outra arquitetura, não apenas uma opção visual.

## Velocidade e responsividade

Medir separadamente toque→confirmação no servidor e confirmação→exibição no celular. Objetivo inicial de projeto: 95% dos chamados aparecerem em até 2 s no Wi-Fi do piloto, com aplicativo aberto; validar por medição, não prometer antecipadamente.

Índices de restaurant_id + status + requested_at; consultas só da unidade e dados necessários; paginação do histórico; métricas agregadas no servidor. Realtime sem refazer todas as consultas para cada evento; reconectar e reconciliar a fila ao voltar à tela. Usar estado “salvando” imediato sem exibir sucesso antes da gravação. Medir antes de adicionar cache ou infraestrutura.

PWA pode permitir acesso pela tela inicial. Som exige ativação pelo usuário; notificações em segundo plano dependem de plataforma, permissões e implementação Web Push. Não prometer que um celular bloqueado receberá todo alerta apenas por usar Realtime. No piloto, testar dispositivos reais e prever um painel fixo de apoio.

## Ordem de implementação e aceite

1. Aprovar direção visual em protótipo de fila mobile e salão desktop. Aceite: tarefa entendida sem treinamento, sem rolagem horizontal em 360/390/768/1440 px, foco/contraste e estados vazios/erro/conexão bem definidos.
2. Implementar associações, convites, proteção de rotas e RLS. Aceite: testes cruzados A/B passam no banco e Realtime; usuário não promove papel.
3. Implementar transações de chamado e idempotência. Aceite: dois atendentes concorrentes geram um vencedor; repetição de evento não duplica; falha não deixa mesa divergente.
4. Implementar pareamento/API e um ESP32 em bancada. Aceite: credencial revogada é recusada; perda de Wi-Fi visível; retomada não duplica nem entrega pedido expirado; LED acompanha confirmação e estado.
5. Aplicar nova interface e indicadores reais. Aceite: garçom vê só operação autorizada; métricas têm período/definição clara; modo demonstração separado.
6. Piloto com 3–5 mesas, gerente e garçons reais. Medir latência, falhas, clareza dos LEDs, resposta humana e cobertura Wi-Fi. Expandir quando esses dados sustentarem a operação.

Referências: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail ; https://github.com/espressif/arduino-esp32/blob/master/libraries/NetworkClientSecure/README.md
