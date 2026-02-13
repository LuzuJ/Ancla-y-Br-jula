# Ancla y Brújula - PWA

Una Progressive Web App (PWA) de acompañamiento emocional basada en Terapia Cognitivo-Conductual (TCC).

## 🚀 Características

### 🧘 **Ancla (TCC Chat)**
- Asistente de IA con Terapia Cognitivo-Conductual
- Detecta distorsiones cognitivas automáticamente
- Protocolo de pánico y emergencias
- Sistema de "La Bóveda" para autoestima

### 🌬️ **Ejercicios de Respiración**
- Técnica 4-4-4-4 (respiración cuadrada)
- Guía visual y de voz
- Vibración háptica

### 🗺️ **Brújula**
- Contenido diario curado con IA
- Citas estoicas reales
- Música, arte y poesía
- Micro-acciones psicológicas

### 📔 **Bitácora**
- Diario emocional privado
- Seguimiento de estados de ánimo
- Medición de intensidad
- Almacenamiento offline

### 🔐 **La Bóveda**
- Evidencias de autoestima
- Logros, cumplidos, superaciones
- Categorización inteligente

### 👤 **Perfil**
- Estadísticas de uso
- Configuración personalizada
- Gestión de datos

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Estado**: Zustand
- **Base de Datos**: Supabase (PostgreSQL)
- **IA**: Google Gemini 2.0
- **PWA**: Workbox + vite-plugin-pwa
- **Offline**: IndexedDB (idb)

## 📦 Instalación

### 1. Clonar el repositorio

```bash
cd app
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y añade tus credenciales:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
VITE_GEMINI_API_KEY=tu_api_key_de_gemini
```

### 3. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a SQL Editor
3. Ejecuta el contenido de `supabase-schema.sql`
4. Copia tu URL y Anon Key desde Project Settings > API

### 4. Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una API Key
3. Añádela al `.env`

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La app estará en `http://localhost:5173`

### 6. Build para producción

```bash
npm run build
```

Los archivos estarán en `dist/`

## 📱 PWA Features

- ✅ Instalable en iOS y Android
- ✅ Funciona 100% offline
- ✅ Sincronización automática cuando hay conexión
- ✅ Push notifications (opcional)
- ✅ Optimizada para rendimiento

## 🗂️ Estructura

```
app/
├── public/              # Archivos estáticos
├── src/
│   ├── features/        # Componentes por funcionalidad
│   │   ├── ancla/       # Respiración
│   │   ├── brujula/     # Contenido diario
│   │   ├── bitacora/    # Diario
│   │   ├── espejo/      # Chat TCC
│   │   ├── boveda/      # Autoestima
│   │   ├── perfil/      # Usuario
│   │   └── auth/        # Login/Onboarding
│   ├── services/        # Lógica de negocio
│   │   ├── supabase.ts  # Base de datos
│   │   ├── gemini.ts    # IA con lógica TCC
│   │   └── offline.ts   # IndexedDB
│   ├── store/           # Estado global (Zustand)
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Entrada
│   └── index.css        # Estilos globales
├── supabase-schema.sql  # Schema de BD
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 🧠 Lógica TCC

El asistente "Ancla" implementa:

1. **Fase de Validación**: Empatía sin contradicción
2. **Fase de Cuestionamiento**: Preguntas socráticas
3. **Detección de Distorsiones**: 
   - Generalización
   - Pensamiento todo/nada
   - Catastrofismo
   - Autodesprecio
   - Adivinación del futuro
   - Lectura mental

4. **Triggers Automáticos**:
   - `[TRIGGER_VAULT]`: Abre La Bóveda
   - `[TRIGGER_PANIC_MODE]`: Protocolo de grounding
   - `[TRIGGER_EMERGENCY_CONTACT]`: Líneas de ayuda

## 🔒 Privacidad

- Todos los datos se almacenan encriptados
- Row Level Security (RLS) en Supabase
- Funcionamiento offline first
- Sin tracking de terceros

## ⚠️ Disclaimer

**Ancla y Brújula NO reemplaza ayuda profesional.** Si tienes pensamientos de autolesión, contacta inmediatamente a:

- **México**: 800-290-0024 (Línea de la Vida)
- **España**: 024
- **Argentina**: 135
- **Colombia**: 106
- **Internacional**: https://findahelpline.com

## 📄 Licencia

MIT License

---

**Hecho con ❤️ para quienes buscan calma**
