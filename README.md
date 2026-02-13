# 🧭 Ancla y Brújula

**Aplicación de acompañamiento emocional con Terapia Cognitivo-Conductual (TCC).**

Progressive Web App construida con React + TypeScript + Supabase + Google Gemini AI.

---

## ✅ Estado del Proyecto

**✨ PROYECTO LIMPIO Y REORGANIZADO (Febrero 2026)**

### Estructura Actual:
```
📦 Ancla-y-Br-jula/
├── 📁 app/                    ← ⚡ ÚNICA CARPETA FUNCIONAL
│   ├── src/
│   │   ├── presentation/     # 🎨 UI (Screens y Components)
│   │   ├── application/      # 🧠 Estado (Zustand Stores)
│   │   ├── domain/          # 📦 Modelos y Constantes
│   │   └── infrastructure/  # 🔌 APIs y DB (Supabase, Gemini, IndexedDB)
│   ├── ARCHITECTURE.md      # 📐 Documentación de arquitectura
│   ├── QUICKSTART.md        # ⚡ Guía de 5 minutos
│   ├── README.md            # 📖 Documentación completa
│   └── package.json
└── README.md                # 👈 Este archivo
```

### 🗑️ Carpetas Eliminadas:
- ✅ `backend/` (MongoDB + Express) - Reemplazado por Supabase
- ✅ `mobile/` (React Native) - Reemplazado por PWA
- ✅ `web-legacy/` (Vite antiguo) - Reemplazado por `app/`

---

## 🏗️ Arquitectura de 4 Capas

El proyecto sigue una **arquitectura limpia en capas** que separa responsabilidades:

```
┌─────────────────────────────────────────┐
│  Presentation Layer (UI)                │  ← Screens y Components
├─────────────────────────────────────────┤
│  Application Layer (Lógica de App)      │  ← Zustand Stores
├─────────────────────────────────────────┤
│  Domain Layer (Modelos de Negocio)      │  ← Types y Constants
├─────────────────────────────────────────┤
│  Infrastructure Layer (Servicios)       │  ← Supabase, Gemini, IndexedDB
└─────────────────────────────────────────┘
```

### 📐 Principios de Diseño:
1. **Separation of Concerns:** Cada capa tiene una responsabilidad clara
2. **Dependency Rule:** Las dependencias apuntan hacia el Domain Layer
3. **Testability:** Cada capa puede testearse independientemente
4. **Scalability:** Fácil agregar nuevas features sin romper lo existente

**📚 Lee la documentación completa:** [app/ARCHITECTURE.md](app/ARCHITECTURE.md)

---

## ✨ Características

### 🪞 **El Espejo** (Chat TCC)
Conversación con "Ancla", un asistente de TCC que:
- Valida emociones sin juzgar
- Detecta distorsiones cognitivas automáticamente
- Cuestiona pensamientos con lógica socrática
- Activa protocolos de emergencia cuando detecta palabras clave

### 🗄️ **La Bóveda** (Autoestima)
Almacén de evidencias tangibles de tu valor:
- 🏆 Logros
- 💝 Cumplidos recibidos
- 💪 Superaciones
- ✨ Habilidades

### ⚓ **El Ancla** (Respiración)
Ejercicio  de respiración 4-4-4-4:
- Animación visual guiada
- Contador de ciclos
- Voz sintética (opcional)

### 🧭 **La Brújula** (Contenido Diario)
Contenido curado generado por IA:
- 💬 Frases motivacionales
- 🎵 Música sugerida
- 🎨 Arte conceptual
- 📜 Poemas breves
- 🎯 Micro-retos diarios

### 📔 **La Bitácora** (Diario Emocional)
Registro de emociones con:
- 6 estados emocionales
- Escala de intensidad (1-5)
- Entrada de texto libre
- Historial navegable

### 👤 **Perfil**
Gestión de cuenta y configuración:
- Estadísticas personales
- Configuración de notificaciones
- Exportación de datos
- Borrado de historial

---

## 🚀 Inicio Rápido

### 1. **Navega a la carpeta del proyecto:**
```bash
cd app/
```

### 2. **Instala dependencias:**
```bash
npm install
```

### 3. **Configura variables de entorno:**
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env y agrega tus credenciales:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_GEMINI_API_KEY
```

### 4. **Ejecuta el schema de base de datos:**
- Abre [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new)
- Copia y pega el contenido de `supabase-schema.sql`
- Ejecuta el script

### 5. **Inicia el servidor de desarrollo:**
```bash
npm run dev
```

🎉 **La app estará corriendo en:** `http://localhost:5173/`

**📖 Guía detallada:** [app/QUICKSTART.md](app/QUICKSTART.md)

---

## 🧪 Tech Stack

| Categoría | Tecnología |
|-----------|------------|
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS |
| **Build Tool** | Vite |
| **State Management** | Zustand |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Google Gemini 2.0 Flash |
| **Offline Storage** | IndexedDB (vía idb) |
| **PWA** | vite-plugin-pwa + Workbox |
| **Auth** | Supabase Auth |

---

## 📂 Estructura de Carpetas

```
app/src/
├── presentation/              # 🎨 Capa de Presentación
│   ├── screens/
│   │   ├── ancla/            # Respiración
│   │   ├── auth/             # Login y Onboarding
│   │   ├── bitacora/         # Diario emocional
│   │   ├── boveda/           # Bóveda de autoestima
│   │   ├── brujula/          # Contenido curado
│   │   ├── espejo/           # Chat TCC
│   │   └── perfil/           # Perfil de usuario
│   └── components/           # Componentes reutilizables
│
├── application/               # 🧠 Capa de Aplicación
│   ├── store/                # Estado global (Zustand)
│   │   └── index.ts          # 5 stores: Auth, Journal, Vault, Chat, Content
│   └── hooks/                # Custom hooks (futuro)
│
├── domain/                    # 📦 Capa de Dominio
│   ├── models/               # Tipos TypeScript
│   │   └── index.ts          # User, JournalEntry, VaultEntry, etc.
│   └── constants/            # Constantes de negocio
│       └── index.ts          # EMERGENCY_CONTACTS, MOODS, etc.
│
└── infrastructure/            # 🔌 Capa de Infraestructura
    ├── api/
    │   ├── supabase.ts       # Cliente Supabase + CRUD services
    │   └── gemini.ts         # Gemini AI + lógica TCC completa
    ├── database/
    │   └── offline.ts        # IndexedDB + sync queue
    └── config/
        └── environment.ts    # Variables de entorno
```

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo (http://localhost:5173)

# Producción
npm run build            # Build para producción
npm run preview          # Preview del build

# Validación
npx tsc --noEmit         # Verifica tipos TypeScript
```

---

## 🌐 Deployment

### Vercel (Recomendado)
```bash
# Instala Vercel CLI
npm install -g vercel

# Deploy con un comando
vercel
```

### Netlify
```bash
# Instala Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Docker
```bash
# Build imagen
docker build -t ancla-brujula .

# Run contenedor
docker run -p 5173:5173 ancla-brujula
```

**⚠️ Importante:** Configura las variables de entorno en tu plataforma de hosting.

---

## 📱 PWA (Progressive Web App)

La aplicación es instalable como app nativa en:

### 📱 **Móvil**
- **Android:** Chrome → Menú → "Agregar a pantalla de inicio"
- **iOS:** Safari → Compartir → "Agregar a pantalla de inicio"

### 💻 **Desktop**
- **Chrome/Edge:** Botón de instalación en la barra de direcciones
- **Firefox:** Extensión PWA necesaria

### Características PWA:
- ✅ Funciona offline
- ✅ Instalabl en dispositivos
- ✅ Notificaciones push (futuro)
- ✅ Actualizaciones automáticas
- ✅ Cache inteligente con Workbox

---

## 🔐 Seguridad y Privacidad

- **Row Level Security (RLS)** en Supabase: Los usuarios solo ven sus propios datos
- **Autenticación** segura con Supabase Auth
- **Offline-first:** Tus datos se guardan localmente primero, luego sincronizan
- **Sin tracking:** No usamos Google Analytics ni servicios de terceros
- **Open Source:** Código auditable

---

## 🛠️ Desarrollo

### Agregar una nueva pantalla:
```bash
# 1. Crea el componente
touch app/src/presentation/screens/nueva/Nueva.tsx

# 2. Importa en App.tsx
import Nueva from '@/presentation/screens/nueva/Nueva';

# 3. Agrega al enrutamiento
<Nueva /> // en el switch de pantallas
```

### Agregar un nuevo servicio:
```bash
# 1. Crea el archivo
touch app/src/infrastructure/api/nuevoServicio.ts

# 2. Implementa la lógica
export const nuevoServicio = {
  async getData() { ... }
};

# 3. Úsalo en los stores
import { nuevoServicio } from '@/infrastructure/api/nuevoServicio';
```

---

## 🤝 Contribuir

¡Contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Agrega nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

**📐 Asegúrate de seguir la arquitectura de capas documentada en [ARCHITECTURE.md](app/ARCHITECTURE.md)**

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

## ⚠️ Disclaimer

**Ancla y Brújula NO es un sustituto de ayuda profesional.**

Si estás experimentando una crisis de salud mental, contacta inmediatamente:

- 🇲🇽 **México:** Línea de la Vida: `800 911 2000`
- 🇲🇽 **México:** Saptel: `55 5259 8121`
- 🆘 **Emergencias:** `911`

---

## 📞 Contacto

¿Preguntas? ¿Sugerencias? Abre un issue en GitHub.

---

## 🙏 Agradecimientos

- Google Gemini AI por la capacidad de TCC
- Supabase por la infraestructura de base de datos
- La comunidad open source

---

**💙 Construido con amor para quienes lo necesitan.**
