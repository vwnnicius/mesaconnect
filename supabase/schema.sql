-- ==============================================================================
-- MESACONNECT - ESQUEMA DO BANCO DE DADOS SUPABASE (PostgreSQL)
-- ==============================================================================
-- Este arquivo contém todas as tabelas, índices, triggers, políticas de RLS
-- e dados demonstrativos iniciais para o Rodízio Sabor & Grill.
-- Execute este script no SQL Editor do seu projeto Supabase.
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS E DOMÍNIOS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('OWNER', 'MANAGER', 'WAITER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE table_status AS ENUM ('AVAILABLE', 'DO_NOT_DISTURB', 'CALLING', 'ACKNOWLEDGED', 'COMPLETED', 'OFFLINE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE call_status AS ENUM ('CALLING', 'ACKNOWLEDGED', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABELAS PRINCIPAIS

-- RESTAURANTES
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- PERFIS DE USUÁRIOS (vinculados ao Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'WAITER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- DISPOSITIVOS (Hardware ESP32)
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID,
    device_uid TEXT NOT NULL UNIQUE,
    online BOOLEAN NOT NULL DEFAULT true,
    last_seen TIMESTAMPTZ,
    firmware_version TEXT DEFAULT 'v1.0.0-esp32',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- MESAS DO SALÃO
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    status table_status NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(restaurant_id, number)
);

-- Chave estrangeira de devices -> tables (após criação da tabela tables)
DO $$ BEGIN
    ALTER TABLE public.devices 
    ADD CONSTRAINT fk_devices_table 
    FOREIGN KEY (table_id) REFERENCES public.tables(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CHAMADOS DE ATENDIMENTO
CREATE TABLE IF NOT EXISTS public.service_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    acknowledged_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status call_status NOT NULL DEFAULT 'CALLING',
    requested_by TEXT DEFAULT 'CLIENT_BUTTON',
    acknowledged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- AVALIAÇÕES DE CLIENTES (QR CODE)
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
    service_call_id UUID REFERENCES public.service_calls(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- EVENTOS DE DISPOSITIVOS FÍSICOS (Auditoria e Telemetria ESP32)
CREATE TABLE IF NOT EXISTS public.device_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON public.tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON public.tables(status);
CREATE INDEX IF NOT EXISTS idx_service_calls_restaurant_status ON public.service_calls(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_service_calls_requested_at ON public.service_calls(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_evaluations_restaurant ON public.evaluations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_devices_uid ON public.devices(device_uid);

-- 5. CONFIGURAÇÃO DE SUPABASE REALTIME
-- Habilita escuta em tempo real nas tabelas de mesas e chamados (idempotente)
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.service_calls;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. TRIGGER PARA SINCRONIZAÇÃO AUTOMÁTICA DO STATUS DA MESA
CREATE OR REPLACE FUNCTION public.sync_table_status_from_call()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.status = 'CALLING' THEN
            UPDATE public.tables SET status = 'CALLING' WHERE id = NEW.table_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF NEW.status = 'ACKNOWLEDGED' AND OLD.status != 'ACKNOWLEDGED' THEN
            UPDATE public.tables SET status = 'ACKNOWLEDGED' WHERE id = NEW.table_id;
        ELSIF NEW.status IN ('COMPLETED', 'CANCELLED') THEN
            -- Se não houver outro chamado pendente para esta mesa, volta a ficar disponível
            IF NOT EXISTS (
                SELECT 1 FROM public.service_calls 
                WHERE table_id = NEW.table_id 
                AND id != NEW.id 
                AND status IN ('CALLING', 'ACKNOWLEDGED')
            ) THEN
                UPDATE public.tables SET status = 'AVAILABLE' WHERE id = NEW.table_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_table_status ON public.service_calls;
CREATE TRIGGER trigger_sync_table_status
AFTER INSERT OR UPDATE ON public.service_calls
FOR EACH ROW EXECUTE FUNCTION public.sync_table_status_from_call();

-- 7. TRIGGER PARA NOVO USUÁRIO AUTH -> PERFIL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_rest_id UUID;
    user_name TEXT;
BEGIN
    -- Busca o restaurante demo como padrão
    SELECT id INTO default_rest_id
    FROM public.restaurants
    WHERE slug = 'sabor-grill'
    LIMIT 1;

    -- Garante que o nome nunca seja nulo ou vazio
    user_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
        NULLIF(TRIM(split_part(NEW.email, '@', 1)), ''),
        'Usuário'
    );

    INSERT INTO public.profiles (id, restaurant_id, name, role)
    VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data->>'restaurant_id')::uuid, default_rest_id),
        user_name,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'WAITER')
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
EXCEPTION
    -- Nunca deixa o erro do trigger bloquear a criação do usuário
    WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user falhou para %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_events ENABLE ROW LEVEL SECURITY;

-- Helper para buscar o restaurant_id do usuário logado
CREATE OR REPLACE FUNCTION public.current_user_restaurant_id()
RETURNS UUID AS $$
    SELECT restaurant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- POLÍTICAS: RESTAURANTES
DROP POLICY IF EXISTS "Visualização de restaurante pelos funcionários" ON public.restaurants;
CREATE POLICY "Visualização de restaurante pelos funcionários"
ON public.restaurants FOR SELECT
TO authenticated
USING (id = public.current_user_restaurant_id());

DROP POLICY IF EXISTS "Visualização pública de dados básicos do restaurante (para QR Code)" ON public.restaurants;
CREATE POLICY "Visualização pública de dados básicos do restaurante (para QR Code)"
ON public.restaurants FOR SELECT
TO anon
USING (true);

-- POLÍTICAS: PERFIS
DROP POLICY IF EXISTS "Usuário pode visualizar perfis do mesmo restaurante" ON public.profiles;
CREATE POLICY "Usuário pode visualizar perfis do mesmo restaurante"
ON public.profiles FOR SELECT
TO authenticated
USING (restaurant_id = public.current_user_restaurant_id());

DROP POLICY IF EXISTS "Usuário pode atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuário pode atualizar seu próprio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "Sistema insere perfil no registro do usuário" ON public.profiles;
CREATE POLICY "Sistema insere perfil no registro do usuário"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- POLÍTICAS: MESAS
DROP POLICY IF EXISTS "Funcionários visualizam mesas do restaurante" ON public.tables;
CREATE POLICY "Funcionários visualizam mesas do restaurante"
ON public.tables FOR SELECT
TO authenticated
USING (restaurant_id = public.current_user_restaurant_id());

DROP POLICY IF EXISTS "Leitura pública de mesas para tela de QR Code" ON public.tables;
CREATE POLICY "Leitura pública de mesas para tela de QR Code"
ON public.tables FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "Gerência/Sistema atualiza status de mesas" ON public.tables;
CREATE POLICY "Gerência/Sistema atualiza status de mesas"
ON public.tables FOR ALL
TO authenticated
USING (restaurant_id = public.current_user_restaurant_id());

DROP POLICY IF EXISTS "Permitir atualização de mesa pelo simulador" ON public.tables;
CREATE POLICY "Permitir atualização de mesa pelo simulador"
ON public.tables FOR UPDATE
TO anon
USING (true);

-- POLÍTICAS: CHAMADOS (SERVICE_CALLS)
DROP POLICY IF EXISTS "Funcionários gerenciam chamados do restaurante" ON public.service_calls;
CREATE POLICY "Funcionários gerenciam chamados do restaurante"
ON public.service_calls FOR ALL
TO authenticated
USING (restaurant_id = public.current_user_restaurant_id());

DROP POLICY IF EXISTS "Simulador e Botão criam chamados" ON public.service_calls;
CREATE POLICY "Simulador e Botão criam chamados"
ON public.service_calls FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Simulador atualiza chamados" ON public.service_calls;
CREATE POLICY "Simulador atualiza chamados"
ON public.service_calls FOR UPDATE
TO anon
USING (true);

DROP POLICY IF EXISTS "Leitura pública de chamados ativos pelo simulador" ON public.service_calls;
CREATE POLICY "Leitura pública de chamados ativos pelo simulador"
ON public.service_calls FOR SELECT
TO anon
USING (true);

-- POLÍTICAS: AVALIAÇÕES (EVALUATIONS)
DROP POLICY IF EXISTS "Clientes anônimos inserem avaliações via QR Code" ON public.evaluations;
CREATE POLICY "Clientes anônimos inserem avaliações via QR Code"
ON public.evaluations FOR INSERT
TO anon
WITH CHECK (rating >= 1 AND rating <= 5);

DROP POLICY IF EXISTS "Funcionários visualizam avaliações do restaurante" ON public.evaluations;
CREATE POLICY "Funcionários visualizam avaliações do restaurante"
ON public.evaluations FOR SELECT
TO authenticated
USING (restaurant_id = public.current_user_restaurant_id());

DROP POLICY IF EXISTS "Visualização pública de avaliações pelo simulador" ON public.evaluations;
CREATE POLICY "Visualização pública de avaliações pelo simulador"
ON public.evaluations FOR SELECT
TO anon
USING (true);

-- POLÍTICAS: DISPOSITIVOS
DROP POLICY IF EXISTS "Funcionários visualizam dispositivos do restaurante" ON public.devices;
CREATE POLICY "Funcionários visualizam dispositivos do restaurante"
ON public.devices FOR ALL
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Leitura pública de dispositivos" ON public.devices;
CREATE POLICY "Leitura pública de dispositivos"
ON public.devices FOR SELECT
TO anon
USING (true);

-- POLÍTICAS: DEVICE_EVENTS
DROP POLICY IF EXISTS "Inserção pública de eventos pelo ESP32 e Simulador" ON public.device_events;
CREATE POLICY "Inserção pública de eventos pelo ESP32 e Simulador"
ON public.device_events FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Funcionários visualizam eventos de telemetria" ON public.device_events;
CREATE POLICY "Funcionários visualizam eventos de telemetria"
ON public.device_events FOR SELECT
TO authenticated
USING (true);

-- ==============================================================================
-- 9. DADOS DEMONSTRATIVOS (SEED DATA)
-- IDENTIFICAÇÃO CLARA: DADOS DEMO PARA APRESENTAÇÃO
-- Restaurante: Rodízio Sabor & Grill (10 mesas com chamados históricos)
-- ==============================================================================

DO $$
DECLARE
    demo_rest_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
    t1_id UUID; t2_id UUID; t4_id UUID; t7_id UUID; t8_id UUID;
BEGIN
    -- 1. Cria restaurante demonstrativo
    INSERT INTO public.restaurants (id, name, slug)
    VALUES (demo_rest_id, 'Rodízio Sabor & Grill', 'sabor-grill')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;

    -- 2. Cria 10 mesas
    INSERT INTO public.tables (id, restaurant_id, number, status) VALUES
    (gen_random_uuid(), demo_rest_id, '01', 'AVAILABLE'),
    (gen_random_uuid(), demo_rest_id, '02', 'AVAILABLE'),
    (gen_random_uuid(), demo_rest_id, '03', 'AVAILABLE'),
    (gen_random_uuid(), demo_rest_id, '04', 'CALLING'),
    (gen_random_uuid(), demo_rest_id, '05', 'DO_NOT_DISTURB'),
    (gen_random_uuid(), demo_rest_id, '06', 'AVAILABLE'),
    (gen_random_uuid(), demo_rest_id, '07', 'CALLING'),
    (gen_random_uuid(), demo_rest_id, '08', 'ACKNOWLEDGED'),
    (gen_random_uuid(), demo_rest_id, '09', 'AVAILABLE'),
    (gen_random_uuid(), demo_rest_id, '10', 'OFFLINE')
    ON CONFLICT (restaurant_id, number) DO UPDATE SET status = EXCLUDED.status;

    -- Recupera IDs das mesas criadas (com LIMIT 1)
    SELECT id INTO t1_id FROM public.tables WHERE restaurant_id = demo_rest_id AND number = '01' LIMIT 1;
    SELECT id INTO t2_id FROM public.tables WHERE restaurant_id = demo_rest_id AND number = '02' LIMIT 1;
    SELECT id INTO t4_id FROM public.tables WHERE restaurant_id = demo_rest_id AND number = '04' LIMIT 1;
    SELECT id INTO t7_id FROM public.tables WHERE restaurant_id = demo_rest_id AND number = '07' LIMIT 1;
    SELECT id INTO t8_id FROM public.tables WHERE restaurant_id = demo_rest_id AND number = '08' LIMIT 1;

    -- 3. Cria dispositivos vinculados
    INSERT INTO public.devices (table_id, device_uid, online, last_seen)
    VALUES 
    (t7_id, 'MESA-007-ESP32', true, now()),
    (t4_id, 'MESA-004-ESP32', true, now()),
    (t8_id, 'MESA-008-ESP32', true, now()),
    (t1_id, 'MESA-001-ESP32', true, now())
    ON CONFLICT (device_uid) DO NOTHING;

    -- 4. Limpa chamados anteriores para evitar duplicidade em execuções repetidas
    DELETE FROM public.service_calls WHERE restaurant_id = demo_rest_id;

    -- 5. Cria chamados ativos em tempo real para demonstração imediata
    -- Chamado Mesa 07: solicitado há 45 segundos (CALLING)
    INSERT INTO public.service_calls (restaurant_id, table_id, requested_at, status)
    VALUES (demo_rest_id, t7_id, now() - INTERVAL '45 seconds', 'CALLING');

    -- Chamado Mesa 04: solicitado há 2 minutos e 10 segundos (CALLING)
    INSERT INTO public.service_calls (restaurant_id, table_id, requested_at, status)
    VALUES (demo_rest_id, t4_id, now() - INTERVAL '130 seconds', 'CALLING');

    -- Chamado Mesa 08: solicitado há 3 minutos e assumido há 1 minuto (ACKNOWLEDGED)
    INSERT INTO public.service_calls (restaurant_id, table_id, requested_at, acknowledged_at, status)
    VALUES (demo_rest_id, t8_id, now() - INTERVAL '180 seconds', now() - INTERVAL '60 seconds', 'ACKNOWLEDGED');

    -- 6. Cria chamados históricos concluídos hoje (para cálculo de estatísticas e gráficos)
    INSERT INTO public.service_calls (restaurant_id, table_id, requested_at, acknowledged_at, completed_at, status)
    VALUES
    (demo_rest_id, t1_id, now() - INTERVAL '4 hours', now() - INTERVAL '3 hours 59 minutes', now() - INTERVAL '3 hours 55 minutes', 'COMPLETED'),
    (demo_rest_id, t2_id, now() - INTERVAL '3 hours', now() - INTERVAL '2 hours 59 minutes 15 seconds', now() - INTERVAL '2 hours 54 minutes', 'COMPLETED'),
    (demo_rest_id, t7_id, now() - INTERVAL '2 hours', now() - INTERVAL '1 hour 59 minutes 10 seconds', now() - INTERVAL '1 hour 53 minutes', 'COMPLETED'),
    (demo_rest_id, t4_id, now() - INTERVAL '1 hour', now() - INTERVAL '59 minutes 20 seconds', now() - INTERVAL '55 minutes', 'COMPLETED');

    -- 7. Limpa e recria avaliações demonstrativas de clientes
    DELETE FROM public.evaluations WHERE restaurant_id = demo_rest_id;

    INSERT INTO public.evaluations (restaurant_id, table_id, rating, comment, created_at)
    VALUES
    (demo_rest_id, t1_id, 5, 'Picanha sensacional e o garçom chegou em menos de 1 minuto!', now() - INTERVAL '3 hours 50 minutes'),
    (demo_rest_id, t2_id, 5, 'Atendimento impecável! O botão na mesa facilitou muito.', now() - INTERVAL '2 hours 50 minutes'),
    (demo_rest_id, t7_id, 4, 'Muito bom e prático. Rodízio ágil!', now() - INTERVAL '1 hour 50 minutes');

END $$;
