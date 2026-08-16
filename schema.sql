-- Habilitar extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: profiles
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    pais TEXT,
    universidad TEXT,
    ano_cursada INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: categories (Materias)
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar las materias troncales
INSERT INTO categories (nombre, descripcion) VALUES
('Anatomofisiología', 'Estudio de la estructura y función del cuerpo humano.'),
('Farmacología', 'Estudio de los medicamentos y sus efectos en el organismo.'),
('Enfermería Comunitaria', 'Atención de salud orientada a la comunidad.'),
('Maternoinfantil', 'Cuidados de salud a la madre y al niño.'),
('Adulto y Anciano', 'Cuidados de enfermería en el adulto y adulto mayor.'),
('Cuidados Críticos', 'Atención a pacientes en estado crítico.'),
('Ética y Legislación', 'Principios éticos y marco legal de la profesión.');

-- Tabla: documents (Materiales de estudio)
CREATE TABLE documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    materia_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    pais TEXT,
    universidad TEXT,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: study_notes (Resúmenes y fichas)
CREATE TABLE study_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    estudiante_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: exam_results (Resultados de exámenes simulados y escaneados)
CREATE TABLE exam_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    materia TEXT NOT NULL,
    score NUMERIC NOT NULL,
    total_questions INTEGER NOT NULL,
    is_scanned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- SUSCRIPCIONES Y CONTROL DE ACCESO
-- =============================================
-- Si la tabla profiles YA EXISTE en Supabase, usar ALTER TABLE:
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
--
-- Si estás creando la BD desde cero, estos campos ya están en el CREATE TABLE profiles arriba.
-- De lo contrario, ejecuta los ALTER TABLE manualmente en el SQL Editor de Supabase.

-- Tabla: payments (Registro de cobros con Mercado Pago)
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 50000,
    mp_payment_id TEXT,
    mp_preference_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índice para búsqueda rápida por mp_payment_id en el webhook
CREATE INDEX IF NOT EXISTS idx_payments_mp_payment_id ON payments(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
