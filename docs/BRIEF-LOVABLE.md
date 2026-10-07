# Briefing de design — MesaConnect

Criar um protótipo visual navegável para o MesaConnect, plataforma de atendimento por mesa para restaurantes e rodízios. Usar dados fictícios explicitamente identificados. Não conectar banco de produção, não criar repositório GitHub, não substituir o Next.js existente e não publicar automaticamente. O resultado será referência para implementação no repositório https://github.com/vwnnicius/mesaconnect.

O produto atual parece um dashboard administrativo genérico: menu lateral, quatro indicadores, cards e gráficos. Precisamos de uma composição própria que represente o trabalho no salão. Apple e Linear são referências de precisão e hierarquia, sem copiar a identidade dessas marcas.

Entregue duas telas principais conectadas:

1. **Fila do garçom, mobile-first.** Exemplo em 390 px, funcionamento também em 360 px. Cabeçalho pequeno com nome do setor, identidade do funcionário e estado da conexão. Título “Mesas esperando” e quantidade. Primeiro chamado enfatizado pela tipografia, com número da mesa dominante, espera legível e ação “Estou indo”. Demais chamados em lista com divisores, sem encaixotar tudo. Atendimentos assumidos em seção separada com ação “Concluir”. Navegação inferior: Fila, Salão, Meu turno. Sem analytics, configurações ou simulador na navegação do garçom.
2. **Salão do gerente, desktop e tablet.** Planta fictícia explicitamente identificada como ilustrativa, com mesas distribuídas espacialmente. O salão ocupa a maior parte da tela; lista lateral de atenção com espera e responsável. Resumo discreto do turno com período e definição de métricas. Navegação: Operação, Equipe, Desempenho, Configurações. Mostrar seleção de restaurante/unidade, mas não fingir que existe isolamento de produção.

Direção visual: fundo #F5F3EF, superfícies #FFFEFC, texto #202522, linhas #DEDCD6 e ação azul profundo #234B68. Contraste deve ser conferido e cores ajustadas quando necessário. Tipografia sans refinada, escala nítida, números tabulares para tempo; título pode ter tratamento editorial discreto. Hierarquia por espaço, tamanho e peso, não por dezenas de ícones e cores. Bordas de 1 px, raios moderados, sombra só onde existe sobreposição. Sem glow, gradientes genéricos, bento grid, emojis decorativos ou grandes áreas vazias sem propósito.

Não adicionar fotografia genérica de restaurante ao painel operacional. Não colocar efeito de vidro em conteúdo de leitura. Use movimentos breves na mudança de estado, respeitando redução de movimento. Cor nunca é a única indicação de estado.

Protótipo deve demonstrar: fila vazia, chamado novo, espera prolongada, assumido por mim, assumido por outro garçom, salvando, erro de gravação, reconectando e dispositivo offline. “Estou indo” muda CALLING para ACKNOWLEDGED; “Concluir” muda para COMPLETED, apenas no estado fictício do protótipo. Mostrar responsável. Nenhum botão essencial sem reação no protótipo.

Testar composição em 360, 390, 768 e 1440 px; controles de toque com pelo menos 48 px; formulário sem zoom involuntário no iPhone; área inferior respeita safe area; sem rolagem horizontal. Modais devem permitir cancelamento e fechar pelo teclado. Não anunciar alerta recebido em segundo plano como funcionalidade real.

Entrega: protótipo das duas telas, estados de operação e tokens/componentes reutilizáveis. Antes de expandir páginas, mostrar a fila mobile e o salão desktop para avaliação visual. Não reconstruir backend, autenticação ou integrações Supabase/Vercel durante esta etapa.

Nota de integração verificada em 7/10/2026: a documentação oficial informa que o Lovable não importa um repositório GitHub existente. Usar este projeto como estudo visual e portar a interface para o repositório MesaConnect. https://docs.lovable.dev/integrations/github
