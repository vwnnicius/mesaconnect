# Demonstração interativa e revisão visual

A rota pública `/demo` apresenta um salão ilustrativo com 12 mesas. Ela usa somente um reducer em memória e não carrega os providers da operação, serviços, credenciais ou clientes Supabase. Recarregar a página ou reiniciar limpa a experiência. Nenhuma ação gera registro no restaurante.

## Percurso

Selecionar mesa → pressionar botão → CALLING → “Estou indo” → ACKNOWLEDGED → “Concluir atendimento” → COMPLETED → avaliação de 1–5 estrelas.

“Reproduzir percurso” percorre as etapas em intervalos de três segundos. Pausar preserva o estado. Interação manual encerra a reprodução para que o visitante assuma o controle. “Reiniciar demo” limpa todas as mesas, eventos e avaliações. É possível gerar chamados em mesas diferentes e alternar entre elas.

Perda de Wi-Fi bloqueia novos pedidos pelo botão e mantém chamados já registrados. O garçom pode concluir um chamado recebido mesmo se o botão perder conexão. Neste protótipo, rede, LED, atendente e tempos são simulados; hardware físico, push, pareamento e autenticação por estabelecimento não são apresentados como implementados.

## Interface da operação

O dashboard prioriza salão e fila ativa, com ações de assumir/concluir reutilizando os serviços existentes. A localização gráfica das mesas é sempre identificada como ilustrativa. O dashboard deixou de exibir indicadores históricos e gráficos fictícios; a página de desempenho ainda conserva seus dados de demonstração identificados.

Paleta neutra quente e verde profundo, tipografia editorial usada em títulos, lista de chamados com divisores e ações grandes. Acesso à demo disponível no menu lateral, cabeçalho e menu “Mais” do celular. Demo tem tema claro próprio; a operação preserva modo claro/escuro conforme o dispositivo.

## Validação

Três testes do reducer cobrem ciclo válido, rejeição de transições/avaliações inválidas, duplicação, perda de conexão, independência das mesas e reinício. Os seis testes anteriores dos serviços continuam aplicáveis. Verificar também reprodução, pausa e ações pelo navegador; layout em 360/390 px, tablet e desktop; mensagens de erro e navegação até a operação.

Não foram aplicadas migrações ao banco nem mudanças de credenciais nesta entrega. Isolamento entre restaurantes, papéis, convites e credenciais de hardware continuam sendo uma etapa própria da evolução de produção descrita na auditoria.
