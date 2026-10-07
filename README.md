# 🍽️ MesaConnect

> **Sistema de Atendimento em Tempo Real por Mesa para Restaurantes e Rodízios**  
> Reduzindo o tempo de espera do cliente e maximizando a produtividade da equipe através de hardware inteligente (ESP32) e aplicativo web ágil.

---

## 📌 Visão Geral e Problema Resolvido

Em restaurantes de rodízio e alta rotatividade, um dos maiores gargalos de satisfação é o momento em que o cliente deseja pedir mais comida, bebida ou fechar a conta, mas o garçom não percebe o gesto. O cliente espera, a experiência piora e o rodízio perde dinamismo.

O **MesaConnect** resolve essa dor:
1. **Dispositivo Físico na Mesa (ESP32)**: O cliente aperta um botão físico discreto.
2. **Recepção Instantânea (Supabase Realtime)**: O evento é transmitido via Wi-Fi em milissegundos.
3. **Painel do Garçom (/calls)**: O garçom vê a mesa chamando com cronômetro em tempo real e assume o atendimento em 1 toque.
4. **Métricas de SLA (/dashboard & /analytics)**: O gerente acompanha o tempo médio e mediano de resposta.
5. **Avaliação pelo QR Code (/evaluate)**: O cliente avalia de 1 a 5 estrelas sem necessidade de login.

---

## 🛠️ Stack Tecnológica

- **Frontend**: [Next.js](https://nextjs.org/) 15 (App Router, Server & Client Components)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) (Design System inspirado em Linear, Vercel e Stripe)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL 15+)
- **Tempo Real**: Supabase Realtime (WebSockets)
- **Autenticação**: Supabase Auth (Perfis: OWNER, MANAGER, WAITER)
- **Segurança**: Row Level Security (RLS) completo
- **Deploy**: [Vercel](https://vercel.com/)
- **Hardware (Futuro)**: Placas ESP32 via Wi-Fi (HTTP REST / WebSockets)

---

## 🏗️ Arquitetura do Sistema

```
[Dispositivo ESP32 Físico]         [Simulador Web (/simulator)]
          \                                     /
           \                                   /
            \---> POST /api/device/events <---/
                           |
                           v
              [Supabase PostgreSQL & Realtime]
              (tables, service_calls, events)
                           |
            +--------------+--------------+
            | Realtime                    | REST / Server Actions
            v                             v
   [Painel Garçom (/calls)]      [Painel Gerente (/dashboard)]
   (Mobile-First, ágil)          (Métricas de SLA, Salão)
```

---

## 📁 Estrutura de Pastas

```
Mesa Connect/
├── .env.example                     # Modelo de variáveis de ambiente
├── README.md                        # Documentação completa do projeto
├── package.json                     # Scripts e dependências do projeto
├── tsconfig.json                    # Configuração TypeScript
├── tailwind.config.ts               # Tokens de cores e design system
├── supabase/
│   └── schema.sql                   # Migrations SQL, RLS, Triggers e Seed Data
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   └── login/page.tsx       # Tela de login profissional (Supabase Auth)
    │   ├── (app)/
    │   │   ├── layout.tsx           # Layout com Sidebar, Topbar e MobileNav
    │   │   ├── dashboard/page.tsx   # Painel gerencial com SLA e gráficos
    │   │   ├── calls/page.tsx       # Painel do garçom ultra-rápido (1-toque)
    │   │   ├── tables/page.tsx      # Mapa visual das mesas (verde, amarelo, azul)
    │   │   ├── analytics/page.tsx   # Relatórios de tempo de resposta e fluxo
    │   │   ├── evaluations/page.tsx # Lista de notas e feedbacks de clientes
    │   │   ├── simulator/page.tsx   # Simulador de hardware ESP32
    │   │   └── settings/page.tsx    # Configurações e links de QR Code
    │   ├── evaluate/
    │   │   └── [restaurant]/[table]/page.tsx # Avaliação pública via QR Code
    │   ├── api/
    │   │   └── device/events/route.ts # API HTTP oficial para dispositivos ESP32
    │   ├── globals.css              # Variáveis CSS e temas claro/escuro
    │   └── page.tsx                 # Redirecionador inteligente raiz
    ├── components/
    │   ├── calls/CallCard.tsx       # Card do garçom com cronômetro em tempo real
    │   ├── layout/                  # Sidebar, Header e barra inferior MobileNav
    │   ├── simulator/               # Painel de botões do ESP32
    │   ├── tables/TableCard.tsx     # Card do salão de mesas
    │   └── ui/                      # Button, Card, Badge, StatusDot
    ├── hooks/
    │   ├── useCalls.ts              # Hook de chamados com Supabase Realtime
    │   ├── useElapsedTime.ts        # Cronômetro de segundos decorridos
    │   └── useTables.ts             # Hook do mapa de mesas com Realtime
    ├── lib/
    │   ├── constants.ts             # Estados de mesa, cores e labels
    │   ├── demo-data.ts             # Conjunto de demonstração inicial
    │   ├── supabase/                # Clientes browser e server do Supabase
    │   └── utils.ts                 # Utilitários de tempo e classes CSS
    ├── services/
    │   ├── callsService.ts          # Ciclo de vida de chamados
    │   ├── deviceService.ts         # Processamento e validação de dispositivos
    │   ├── evaluationsService.ts    # Envio e leitura de avaliações
    │   ├── tablesService.ts         # Consulta e atualização de status de mesas
    │   └── mockStore.ts             # Armazenamento em memória para modo demo
    └── types/
        ├── database.ts              # Tipagem oficial do banco Supabase
        └── index.ts                 # Métricas e interfaces de domínio
```

---

## ⚡ Instalação e Execução Local

### 1. Clonar o repositório
```bash
git clone https://github.com/vwnnicius/mesaconnect.git
cd mesaconnect
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```
Preencha as variáveis obtidas no seu painel do Supabase (**Project Settings > API**):
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
```
> **Nota de Execução Imediata**: O MesaConnect possui um **Modo Demo com Fallback Inteligente**. Caso as variáveis ainda não estejam preenchidas, o sistema inicia normalmente com dados simulados do "Rodízio Sabor & Grill" para que você possa testar sem bloqueios.

### 4. Rodar o servidor de desenvolvimento
```bash
npm run dev
```
Abra seu navegador em: `http://localhost:3000`

---

## 🗄️ Configuração do Banco de Dados (Supabase)

1. Acesse seu projeto no painel do [Supabase](https://supabase.com).
2. Vá até a aba **SQL Editor**.
3. Abra o arquivo `supabase/schema.sql` deste projeto.
4. Cole o conteúdo no editor e clique em **Run**.
5. O script irá criar automaticamente:
   - As 7 tabelas estruturadas (`restaurants`, `profiles`, `tables`, `devices`, `service_calls`, `evaluations`, `device_events`).
   - As políticas de segurança **Row Level Security (RLS)**.
   - Triggers de sincronização de status de mesa e novos usuários.
   - Habilitação de publicações no **Supabase Realtime**.
   - Os dados iniciais demonstrativos (**Rodízio Sabor & Grill** com 10 mesas e histórico).

---

## 🎮 Como Usar o Modo Simulador (ESP32)

Antes de conectar placas físicas, você pode validar o fluxo de ponta a ponta:

1. Acesse a rota `/simulator`.
2. Escolha uma mesa (por exemplo, **Mesa 07**) e clique em **CHAMAR GARÇOM**.
3. Abra a aba `/calls` (em outra aba ou dividindo a tela).
4. O chamado aparecerá imediatamente com cronômetro em tempo real:
   - Clique em **[ ATENDER ]** -> O chamado passa para `ACKNOWLEDGED` e o tempo até resposta é gravado.
   - Clique em **[ CONCLUIR ]** -> O atendimento é finalizado e a mesa volta a ficar disponível (`AVAILABLE`).
5. Acesse `/dashboard` e `/analytics` para ver as métricas atualizadas.

---

## ⭐ Avaliação por QR Code pelo Cliente

- URL da mesa: `/evaluate/[slug-do-restaurante]/[numero-da-mesa]`
- Exemplo para teste: `http://localhost:3000/evaluate/sabor-grill/07`
- Não requer login: o cliente clica de 1 a 5 estrelas, pode deixar um comentário opcional e envia. O feedback cai instantaneamente em `/evaluations`.

---

## 📡 Futura Integração com Hardware Físico (ESP32)

O backend já está preparado para receber requisições HTTP REST de microcontroladores ESP32 conectados à rede Wi-Fi do restaurante.

### Endpoint:
`POST /api/device/events`

### Header:
`Content-Type: application/json`

### Exemplo de Payload:
```json
{
  "device_uid": "MESA-007-ESP32",
  "event_type": "CALL",
  "timestamp": "2026-10-06T23:30:00.000Z"
}
```

### Eventos suportados:
- `CALL`: Botão pressionado pelo cliente (gera chamado e alerta garçons).
- `DO_NOT_DISTURB`: Cliente sinaliza não querer interrupção.
- `RESET`: Mesa liberada.
- `HEARTBEAT`: Verificação periódica de que a placa continua online.

---

## 🚀 Deploy na Vercel

1. Importe o repositório `vwnnicius/mesaconnect` na Vercel.
2. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. O build e deploy serão realizados automaticamente com suporte nativo ao Next.js App Router.

---

## 📄 Licença

Este projeto é desenvolvido para o ecossistema MesaConnect.
