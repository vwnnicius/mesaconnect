# Validação — atualização operacional MesaConnect

Data: 7 de outubro de 2026. Next.js 15.5.27, Windows e Supabase real.

- Lint e TypeScript aprovados, sem avisos. 14 testes automatizados aprovados. Incluem limites mensais, mudança de ano e rejeição de mês inválido.
- Build de produção aprovado, 21 páginas geradas.
- tests/operations-security.sql executado com ROLLBACK: observações, bloqueio de prioridade para garçom, isolamento dos logs, autenticação do dispositivo, estado para LED, última comunicação, agregação e repetição de evento após conclusão sem outro chamado.
- Consulta de gerente: relatório da própria unidade permitido; relatório externo e pareamento rejeitados.
- Logins reais verificados: administrador parceiro, proprietário e gerente Aurora, um garçom de cada uma das três unidades. Leitura de mesas isolada e consulta de permissão da função administrativa verificadas, sem novas contas nesse teste.
- Confirmados dois administradores gerais; cada unidade fictícia tem 1 proprietário, 1 gerente e 3 garçons ativos.
- Oito migrações aplicadas; versões locais alinhadas ao histórico remoto. workspace-admin versão 4 publicada.
- Salão → lista e personalização → lista verificados em navegador; inspetor removido e sem transbordamento horizontal em 1280, 390 e 320 px. Modo escuro e Tela cheia revisados.
- Validação do link Google corrigida e testada no banco: URL oficial resolvida publicamente; domínio externo rejeitado.
- Demo em produção local verificada: cliente chama, garçom assume e conclui, convite opcional para avaliação.
- Senhas dos exemplos ausentes dos arquivos do repositório; secrets.h e .pio ignorados.

## Limites da verificação

ESP32 físico e compilação do firmware não realizados; exemplo requer ensaio da placa adotada. Reconexão e cobertura de Wi-Fi/Realtime precisam de teste de campo. Não houve redefinição real de senha nem criação adicional de conta no teste final da função administrativa. A revisão automática rejeitou um teste de criação privilegiada; foi substituído por consultas de permissão sem criação.

Os indicadores das empresas fictícias começam sem histórico; a demo pública mostra o fluxo sem gravar dados na operação. Ranking exige amostra mínima e não inventa notas individuais. Google Reviews exige link real cadastrado pela gestão.

## Avisos do Supabase

As tabelas privadas de credenciais e recibos não têm políticas de acesso direto intencionalmente; somente funções restritas usam seus dados. Funções públicas de QR/avaliação e gateway são intencionais e limitadas; gateway exige token individual com hash. Funções gerenciais validam unidade/papel no banco.

A [proteção de senhas vazadas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) permanece desativada. Avisos de dependências anteriores exigem atualização planejada, sem forçar mudança principal nesta revisão.

Fontes distribuídas localmente com OFL: [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope), [Fraunces](https://github.com/google/fonts/tree/main/ofl/fraunces).

## Correção de sincronização e tema — revisão seguinte

Publicação Realtime das mesas/chamados confirmada. Assinatura autenticada testada com alteração e restauração da prioridade de uma mesa fictícia. O cliente agora busca uma nova fotografia após SUBSCRIBED/reconexão, retoma ao focar/voltar online e verifica a cada 10 segundos enquanto visível. A Tela também acompanha mudanças de chamados; respostas antigas não sobrescrevem uma consulta mais recente. Erro ao cruzar chamados não é tratado como sucesso.

Teste visual em dois painéis: simulador criou chamado na mesa 02 de Aurora, Tela mudou sem reload; aceite recebido em aproximadamente 2,5 segundos, conclusão em 1,8 segundo. O chamado de teste foi concluído e permanece no histórico da empresa fictícia. Outras mesas não foram resetadas.

Demo escura corrigida, incluindo planta e dispositivo. Tema por classe, sem conflito com preferência do sistema. Barra lateral pode ser escondida/mostrada e preferência persiste. Responsividade da Tela verificada em 390 px sem transbordamento. 15 logins fictícios redefinidos com senhas genéricas distintas e verificados; lista privada fora do repositório.

Lovable localizado no catálogo, porém não instalado/conectado nesta sessão. Ajustes aplicados no código existente; não foi alegado uso do Lovable.
# Lovable visual integration — 2026-10-07

The Lovable study (project `2a6699cd-857f-42f8-97dc-c5d33acd8b91`, commit `c037594`) completed. Its semantic light/dark status tokens, floor surfaces, guided circular step rail and restrained motion were adapted to the existing Next.js app. Prototype font sizes were enlarged for operation. No additional GitHub repository or backend was created.

- Lint, TypeScript, production build (21 pages) and all 14 existing tests passed.
- Browser verified isolated demo call → acknowledgement → completion → 4-star feedback, and restart.
- Demo checked at 320/390 px without horizontal overflow; editorial dark text resolves to `rgb(183, 210, 192)`.
- Authenticated Aurora screen reports “Conectado em tempo real”; six live tables and existing do-not-disturb state preserved. Sidebar hide/show verified. No call-service or Realtime hooks changed in this visual integration; the preceding two-panel synchronization test remains applicable.
- Theme now initializes before paint and synchronizes through storage events across tabs; no new framework or animation dependency.
- Generic fictional-account credentials scanned against tracked/untracked source: no matches. Credential handouts remain outside Git.
