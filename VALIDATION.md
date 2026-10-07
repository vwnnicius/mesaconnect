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
