# Validação da revisão

Data: 7 de outubro de 2026. Ambiente: Windows, Next.js 15.5.27, modo local sem credenciais Supabase.

## Mudanças

- Paleta neutra, azul reservado às ações principais, fonte nativa do sistema, bordas leves e superfícies claras; dark mode preservado no CSS.
- Navegação desktop clara e compacta; navegação mobile com acesso às páginas de gestão pelo menu Mais.
- Métricas agrupadas em uma faixa sem cards individuais ou ícones decorativos; identificação dos indicadores demonstrativos.
- Chamados com números de mesa e cronômetros em destaque, botões grandes, estado de gravação e erro explícito; redução de animações e zoom do navegador liberado.
- Mesas com superfícies neutras e estados legíveis; simulador com controles e mensagens sem truncamento.
- Avaliação resolve a mesa real, valida nota e só confirma envio após sucesso; aprovação calculada em vez de constante e média vazia sem nota fictícia.
- Logout desktop encerra a sessão Supabase. Demonstração no login disponível apenas sem configuração Supabase.
- Serviços de chamados condicionam ACK/COMPLETE ao estado anterior e registram autoria autenticada quando disponível; deixam de replicar gravações reais em um store fictício.
- Simulador local resolve UID de três dígitos corretamente, rejeita dispositivo desconhecido e reaproveita chamado ativo duplicado.
- ESLint 9 configurado com flat config; scripts `lint`, `typecheck` e `test` disponíveis.

## Limites

Nenhuma migration ou política foi aplicada no Supabase. Não foram alteradas variáveis da Vercel. Testes locais e mocks não comprovam Auth/RLS/Realtime do projeto publicado, nem a entrega de eventos de um ESP32 físico. Os serviços legados de mesas e leitura de avaliações ainda têm fallback; a auditoria registra o trabalho necessário.

`npm audit` retornou 11 vulnerabilidades (8 altas e 3 moderadas), em cadeias de PostCSS, Tailwind e ESLint/Next. As correções propostas incluem mudanças de versão principal; não foi executado `npm audit fix --force`. O relatório deve ser tratado como lista de advisories, não como prova de exploração em produção.

## Comandos e revisão visual

- `npm ci`: concluído. O isolamento de rede do ambiente exigiu autorização para baixar dependências.
- `npm run lint`: exit 0, sem erros; 24 warnings de `any` já presentes na camada legada.
- `npm run typecheck`: exit 0, após o build final.
- `npm test`: 6 testes aprovados. Cobrem ciclo do chamado, rejeição de transição repetida, duplicidade local, mesa correta pelo UID, rejeição de dispositivo/link inválido, nota válida e erros de Supabase sem fallback de sucesso. As requisições no teste de falha são simuladas; nenhum banco real é acessado.
- `npm run build`: exit 0, todas as 14 páginas geradas e tipos verificados. O primeiro build foi bloqueado pelo sandbox Windows (`SWC / acesso negado`); a execução autorizada fora desse isolamento passou.
- `git diff --check`: sem erros de whitespace (o Git avisa apenas sobre normalização de LF/CRLF no Windows).
- Browser: desktop e mobile 390 px; painel e analytics também conferidos em 320 px, sem overflow horizontal após correção dos gráficos. Foram observados temas claro e escuro.
- Fluxo local no navegador: assumir mesa 04, concluir, confirmar mesa disponível; chamar mesa 09 pelo simulador e conferir chamado correto; abrir menu Mais e avaliações; enviar nota/comentário pela avaliação pública, com confirmação explícita de demonstração local.

O modo sem credenciais foi usado para não gerar registros de teste no restaurante em produção. As subscrições Realtime e as políticas reais do Supabase exigem validação separada no ambiente configurado.
