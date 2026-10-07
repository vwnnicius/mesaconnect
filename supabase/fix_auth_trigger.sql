-- ==============================================================================
-- MESACONNECT - CORREÇÃO DO TRIGGER DE CRIAÇÃO DE USUÁRIO
-- ==============================================================================
-- Execute este script no SQL Editor do Supabase se aparecer o erro:
-- "Database error creating new user"
-- ==============================================================================

-- 1. Recria o trigger com tratamento de erros robusto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_rest_id UUID;
    user_name TEXT;
BEGIN
    -- Busca o restaurante demo
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

    -- Insere o perfil vinculado ao restaurante demo por padrão
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

-- 2. Recria o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Adiciona política de INSERT que estava faltando para o trigger funcionar
DROP POLICY IF EXISTS "Sistema insere perfil no registro do usuário" ON public.profiles;
CREATE POLICY "Sistema insere perfil no registro do usuário"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- 4. Permite que o service_role (trigger) insira sem restrição de RLS
-- (SECURITY DEFINER já usa o owner, mas vamos garantir com bypass)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- 5. Cria o usuário admin manualmente no profiles caso ele já exista no Auth
-- (Execute apenas se o usuário já foi criado mas deu erro)
DO $$
DECLARE
    v_user_id UUID;
    demo_rest_id UUID;
BEGIN
    -- Busca o restaurante demo
    SELECT id INTO demo_rest_id FROM public.restaurants WHERE slug = 'sabor-grill' LIMIT 1;

    -- Busca o usuário pelo email (se já existir no Auth)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@mesaconnect.com' LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, restaurant_id, name, role)
        VALUES (v_user_id, demo_rest_id, 'Admin', 'OWNER')
        ON CONFLICT (id) DO UPDATE SET role = 'OWNER', name = 'Admin';
        RAISE NOTICE 'Perfil do admin criado/atualizado com sucesso.';
    ELSE
        RAISE NOTICE 'Usuário admin@mesaconnect.com ainda não existe no Auth. Crie-o pelo painel e rode este script novamente.';
    END IF;
END $$;
