# 🧭 Ancla y Brújula - Frontend PWA

Aplicación Web Progresiva construida con React 18, TypeScript, Tailwind CSS y Vite.

- **Demo en Producción:** [https://anclabu.vercel.app/](https://anclabu.vercel.app/)
- **Documentación Completa:** Consulta el [README principal](../README.md) en la raíz del repositorio.

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar servidor local
npm run dev
```

## 🔑 Variables de Entorno

Configura en tu archivo `.env`:

```env
VITE_DEEPSEEK_API_KEY=tu_api_key_de_deepseek
VITE_GEMINI_API_KEY=tu_api_key_de_gemini
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_supabase
```

## 🛠️ Scripts

- `npm run dev`: Inicia el servidor de desarrollo local en `http://localhost:5173`.
- `npm run build`: Compila la aplicación y genera los assets del Service Worker con Workbox.
- `npm run preview`: Previsualiza el bundle de producción localmente.
- `npm run test`: Ejecuta los tests unitarios con Vitest.
- `npm run test:ui`: Ejecuta los tests en modo interactivo.
