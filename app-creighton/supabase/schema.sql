-- ============================================
-- SCHEMA para App Creighton Practitioner
-- Ejecutar en Supabase → SQL Editor
-- ============================================

-- Tabla de materiales
CREATE TABLE IF NOT EXISTS materiales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 0,
  unidad TEXT NOT NULL DEFAULT 'unidad',
  stock_minimo INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES materiales(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida')),
  cantidad INTEGER NOT NULL,
  motivo TEXT,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  estado TEXT NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'En pausa', 'Cerrado')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de sesiones por paciente
CREATE TABLE IF NOT EXISTS sesiones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  cobro INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de transacciones de caja
CREATE TABLE IF NOT EXISTS transacciones_caja (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
  monto INTEGER NOT NULL,
  categoria TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DATOS INICIALES — materiales precargados
-- ============================================
INSERT INTO materiales (nombre, cantidad, unidad, stock_minimo)
SELECT nombre, 0, 'unidad', 1
FROM (VALUES
  ('Manual de usuario'),
  ('Diccionario ilustrado'),
  ('Set de Estampas iniciales'),
  ('Gráficas'),
  ('Formulario general de inicio'),
  ('Estampas amarillas con bebé'),
  ('Estampas amarillas lisas'),
  ('Spice Index'),
  ('Revisión de ciclos para categorías reproductivas'),
  ('Forma de seguimiento')
) AS t(nombre)
WHERE NOT EXISTS (SELECT 1 FROM materiales LIMIT 1);
