# Situação após a reconstrução — 7 de outubro de 2026

A auditoria original abaixo registra o ponto de partida. Nesta revisão houve acesso ao Supabase real, implantação de cinco migrações e validação de isolamento e fluxo em transações revertidas.

Resolvido: unidade fixa na operação autenticada, permissões anônimas amplas, autopromoção pelo perfil, estados divergentes, reset que escondia chamado, ausência de credencial física, indicadores fictícios, QR com identificação inválida e personalização sem persistência. As telas usam unidade/papel reais, o salão salva posições por restaurante e o simulador e o gateway físico compartilham o domínio transacional.

Implementado: identidade visual baseada nas referências, login, fotos/logos, gestão da equipe, criação de estabelecimentos pelo administrador geral, avaliações/QR, relatórios, pareamento e painel de garçom responsivo. A demonstração permanece separada da operação.

Ainda incompleto para escala: firmware e teste físico, retorno de estado para LED, detecção automática de offline, fila em queda de Wi-Fi, proteção contra abuso de avaliações públicas, agregação/paginação além de 1.000 registros e testes de reconexão Realtime. Persistem advisories de dependências que demandam atualização principal e configuração de proteção de senhas vazadas.

Resultados e limites: [VALIDATION.md](VALIDATION.md). Papéis, implantação e hardware: [guia de operação](docs/OPERACAO-E-HARDWARE.md).

---

## Auditoria inicial (histórico)
# Auditoria MesaConnect — 7 de outubro de 2026

Base inspecionada: commit `2df15c7`, repositório `vwnnicius/mesaconnect`.
Escopo: código versionado, SQL, fluxo das telas, lint/build e demonstração local.
Não houve acesso administrativo ao Supabase nem à Vercel. O SQL descreve políticas propostas; não comprova quais políticas estão instaladas em produção.

## Resultado

A base representa bem a ideia de atendimento por mesa, mas ainda é um MVP parcialmente demonstrativo. Não deve ser tratada como pronta para um piloto com dados sensíveis ou vários restaurantes sem corrigir os itens de segurança e persistência abaixo.

| Área | Correto | Incompleto, frágil ou divergente |
| --- | --- | --- |
| Estrutura | Next.js/App Router, TypeScript, componentes e serviços separados; clientes Supabase browser/server | Tipos contornados com `any`; cliente browser usado também pelo serviço chamado pela API |
| Mesas | Estados legíveis, mapa, tempo e filtros | Restaurante fixo em `RESTAURANT_DEMO`; links QR e identidade fixos; estado pode divergir dos chamados |
| Chamados | CALLING, ACKNOWLEDGED, COMPLETED; ordem do mais antigo; timestamps; trigger de sincronização | Sem unicidade de chamado ativo por mesa; transições sem validação no banco; atualizações separadas de mesa podem contrariar o trigger; autoria do funcionário não preenchida pelos hooks |
| Realtime | Subscrições com filtro por restaurante e limpeza de canais; provider compartilhado | Sem indicador real de conexão, recuperação explícita ou tratamento de erros da subscrição; avaliações não subscritas |
| Auth | Login com Supabase Auth; raiz decide login/painel | Rotas internas sem proteção; botão demo contorna login; sair era só navegação; sem autorização por papel ou resolução do restaurante do perfil |
| RLS | RLS habilitada e algumas consultas filtradas pelo restaurante | **Crítico:** acesso anônimo irrestrito a chamados/mesas; dispositivos/eventos visíveis entre restaurantes; perfil editável permite mudar restaurante/papel; trigger aceita papel/restaurante de metadados do usuário |
| Simulador/ESP32 | Ambos reutilizam `processDeviceEvent`, que chama os serviços de domínio | Cards executam no browser; teste HTTP executa no servidor, com contexto de Auth diferente. Store demo do servidor é separado do browser. UID previsível não autentica hardware; seed só cria quatro dispositivos. No modo local, UIDs com três dígitos não casavam com o número de dois dígitos e caíam na mesa 01 |
| API | Endpoint e quatro tipos de evento implementados | Sem credencial por dispositivo, limites, idempotência ou validação completa; timestamp recebido não usado; falhas de telemetria/heartbeat ignoradas; sem retorno de estado para LED ou detecção real de offline |
| Avaliações | Tela pública e serviço Supabase; nota limitada no SQL | Tela usava `table-07` em coluna UUID, ignorava slug e confirmava sucesso após falha; inserção pública precisa validar relação restaurante/mesa/chamado; sem controle de abuso, QR gráfico ou impressão |
| Gerência/analytics | Telas e gráficos existem | Métricas, SLA e tendências são constantes `DEMO_*`, misturadas com contagens reais. Não há agregação histórica real nem controle de período |
| Configurações | Links de avaliação disponíveis | Campos desabilitados; UID calculado não comprova pareamento; presença de env não comprova conexão |
| Persistência | SQL com FKs, índices e trigger | Fallback local em falhas de Supabase mascara perda de gravação. Seed apaga chamados e avaliações demo ao reexecutar; não é migration incremental segura |
| Deploy | Stack compatível com Vercel; variáveis de ambiente | Sem evidência do estado do deploy remoto nesta auditoria; nenhuma credencial de administração disponível |
| Qualidade | TypeScript strict e build configurados | `next lint` incompatível com ESLint 9 sem configuração; não havia testes nem CI versionados |

## Prioridades para o piloto

1. Revisar RLS no projeto real: retirar escrita pública de chamados/mesas; limitar dispositivos/eventos ao restaurante; impedir mudanças de papel/tenant pelo próprio usuário; criar onboarding confiável. Autorização precisa existir no banco e no servidor, além da UI.
2. Implementar transições transacionais no banco (RPC), unicidade parcial de chamado ativo, autoria por `auth.uid()` e constraints que assegurem a relação restaurante/mesa. Definir RESET/NÃO INCOMODAR durante chamado ativo; hoje pode haver fila pendente com mesa disponível.
3. Configurar ingresso do ESP32 no servidor com credencial individual revogável, rate limit, event_id idempotente e acesso privilegiado estritamente server-side. Compartilhar domínio entre esse ingresso e o simulador autenticado; não tornar `service_role` pública.
4. Resolver unidade/papel pelo profile, proteger rotas, renovar sessão SSR e remover modo demo do acesso à produção autenticada. Distinguir claramente modo demo de falha de rede; estender tratamento explícito a todas as leituras/gravações.
5. Agregar métricas reais por período/fuso; atualizar avaliações por Realtime; gerar e imprimir QR por mesa. Validar avaliações sem abrir leitura pública de comentários ou dados operacionais.
6. Migrar via arquivos incrementais sem seed destrutivo. Testar dois restaurantes, dois garçons concorrentes, eventos duplicados, rede perdida, QR inválido e dispositivo desconectado antes do piloto.

## Intervenção desta revisão

O frontend foi refinado sem migrations ou alteração remota de políticas. Correções pontuais evitam sucesso fictício no formulário de avaliação e na criação de chamados, permitem logout real e limitam transições concorrentes no serviço cliente. No modo local, eventos duplicados reutilizam o chamado ativo, UIDs resolvem a mesa correta e dispositivos desconhecidos são rejeitados. Isso não substitui a proteção transacional e a revisão de RLS descritas acima. Métricas históricas continuam demonstrativas e passam a ser identificadas como tal; a aprovação das avaliações passa a ser calculada sobre as avaliações carregadas.

Veja `VALIDATION.md` para resultados dos comandos e da verificação visual.
