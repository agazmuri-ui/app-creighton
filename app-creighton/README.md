# App Creighton Practitioner

App de gestión para practitioner del Método Creighton.

## Estructura

```
app-creighton/
├── frontend/        ← React + Vite (Vercel)
├── backend/         ← Express + Node.js (Render)
└── supabase/
    └── schema.sql   ← Ejecutar en Supabase SQL Editor
```

## Setup inicial

### 1. Base de datos (Supabase)
1. Ir a supabase.com → tu proyecto → SQL Editor
2. Copiar y pegar el contenido de `supabase/schema.sql`
3. Hacer clic en "Run"

### 2. Backend
```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales de Supabase
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
# Editar .env si el backend corre en otro puerto
npm install
npm run dev
```

La app queda en: http://localhost:5173

## Deploy

### Backend → Render
1. Conectar repositorio GitHub en Render
2. Build command: `npm install`
3. Start command: `node index.js`
4. Agregar variables de entorno: SUPABASE_URL y SUPABASE_ANON_KEY

### Frontend → Vercel
1. Conectar repositorio GitHub en Vercel
2. Root directory: `frontend`
3. Agregar variable de entorno: VITE_API_URL=https://tu-backend.onrender.com
