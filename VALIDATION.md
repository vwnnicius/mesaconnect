# Validação — reconstrução MesaConnect

Data: 7 de outubro de 2026. Windows, Next.js 15.5.27, Supabase real configurado.

## Implementação

Identidade em branco quente, grafite e verde; login com fotografia editorial; chamadas mobile com ações amplas; planta editável persistida por estabelecimento; simulador de mesas, avaliações públicas e gerenciais, métricas reais, QR gráfico com download, identidade e fotos da equipe. Demo isolada preservada.

A conta geral informada foi verificada e habilitada com metadado administrativo confiável. Contas da equipe têm estabelecimento, papel e situação ativos próprios. Senhas e chaves administrativas não estão no repositório.

## Verificações

- Lint: aprovado, sem erros ou avisos.
- TypeScript: aprovado.
- Testes automatizados: 12 aprovados; ciclo, duplicidade, reset durante chamado, credencial de dispositivo, falhas sem fallback, layout e métricas.
- Testes SQL no Supabase real: aprovados; execução com ROLLBACK, sem registros de teste persistidos. Cobrem CALLING→ACKNOWLEDGED→COMPLETED, duplicidade, isolamento entre unidades, bloqueio de autopromoção, pareamento, token inválido e avaliação pública limitada. Fonte: tests/tenant-security.sql.
- Cinco migrações aplicadas no projeto fhbnowqaencrloimnvyt, com versões locais alinhadas ao histórico remoto. workspace-admin publicado, autenticação e acesso geral verificados.
- Quatro inconsistências legadas corrigidas. Verificação final: zero mesas com estado divergente do chamado ativo.
- Planta salva e recuperada do banco. QR gráfico gerado no navegador. Telas revisadas em desktop e em 390 px: chamados, configurações e avaliação sem transbordamento horizontal.
- Build de produção: aprovado; 18 páginas geradas, rotas dinâmicas e tipos verificados.

## Limites conhecidos

Não houve ensaio com ESP32 físico, envio real de e-mail de recuperação, criação de contas adicionais de equipe ou upload de fotos pessoais durante a validação. Realtime de avaliações foi incluído na publicação; falhas e reconexão em redes instáveis ainda precisam de teste de campo.

npm audit mantém 11 advisories (8 altos, 3 moderados), nas cadeias de Next/PostCSS, Tailwind e ESLint. A atualização compatível foi tentada; correções restantes envolvem versões principais e precisam de revisão própria. Não foi executada atualização forçada.

Advisors Supabase: as três funções públicas SECURITY DEFINER são intencionais (entrada com token de dispositivo, resolução segura do QR e envio limitado de nota). As seis funções autenticadas exigem autorização própria. Credenciais privadas não têm políticas de acesso direto, intencionalmente. Proteção contra senha vazada permanece desativada no projeto: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

As limitações de hardware, volume histórico, abuso de avaliações e configuração de recuperação estão em docs/OPERACAO-E-HARDWARE.md.
