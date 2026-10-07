# MesaConnect: direção visual

Hospitalidade discreta para restaurantes de bairro, casas sofisticadas e rodízios. O salão e os chamados orientam a interface; dados confiáveis têm prioridade sobre decoração.

Manrope local para operação e Fraunces apenas em títulos editoriais. Branco quente, grafite e verde, bordas finas, espaços consistentes, poucas superfícies. Modo escuro completo e equivalente ao claro. Cor operacional tem significado e sempre acompanha texto. Nenhum gradiente decorativo ou glow.

Garçom: ações grandes e uma fila simples no celular. Gestão: planta personalizável, equipe, relatórios e avaliações. Tela: informação à distância, chamada pulsante discreta e prioridade explícita. Barra lateral recolhível, sem comprometer a navegação no celular.

Movimento breve (180 a 280 ms), sem parallax ou animações contínuas fora dos alertas operacionais. Respeitar movimento reduzido. Componentes preservam estados vazio, carregando, erro e reconexão.

Ao usar Lovable, trabalhar sobre esta aplicação e suas integrações: não criar outro repositório, não substituir autenticação, não usar métricas fictícias na operação e não revelar credenciais. Avaliar telas reais em 320/390 px e desktop, nos dois temas.

Melhorias futuras: turnos e setores de atendimento, notificações PWA, indicadores de conexão por painel e provisionamento seguro de Wi-Fi para cada ESP32.

## Proposta trabalhada no Lovable

Estudo visual: https://lovable.dev/projects/2a6699cd-857f-42f8-97dc-c5d33acd8b91

Referência de código: `c037594bdbe1fb845f7aea1b9d19a38607b5dd6e`. O Lovable criou uma proposta isolada com estado fictício, sem outro repositório GitHub ou serviços conectados. A prévia exige sessão na conta Lovable. As melhorias foram adaptadas à aplicação existente, mantendo Next.js, fontes locais, autorização por estabelecimento e serviços reais.

Incorporados em `src/app/design-refinements.css`: paleta quente, tokens semânticos de status com variantes escuras, superfícies do mapa e monitor, trilha de etapas com círculos e confirmação, espaçamento e movimento de 220 ms. Tamanhos muito pequenos do protótipo foram ampliados para leitura operacional. O guia de papéis fica após a experiência; o fluxo e suas ações aparecem antes do mapa. A preferência de tema sincroniza entre abas e é aplicada antes da primeira pintura.
