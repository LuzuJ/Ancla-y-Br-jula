# 🚀 Guía de Inicio Rápido - Ancla y Brújula

## ⚡ Setup Rápido (5 minutos)

### 1. Instalar dependencias

```bash
cd app
npm install
```

### 2. Configurar Supabase

**Opción A: Crear nuevo proyecto**
1. Ve a https://supabase.com y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a SQL Editor y ejecuta el contenido de `supabase-schema.sql`
4. Copia tu URL y Anon Key desde Settings > API

**Opción B: Usar Supabase CLI (recomendado)**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Inicializar proyecto
supabase init

# Aplicar migraciones
supabase db push

# Obtener credenciales
supabase status
```

### 3. Obtener API Key de Gemini

1. Ve a https://makersuite.google.com/app/apikey
2. Crea una API Key (es gratis para uso moderado)
3. Cópiala

### 4. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tus credenciales
nano .env  # o usa tu editor favorito
```

Tu `.env` debe verse así:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=AIzaSy...
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

¡Listo! La app estará en `http://localhost:5173`

---

## 📱 Probar en tu móvil

### Opción 1: Túnel con ngrok (PWA real)

```bash
# Instalar ngrok
npm install -g ngrok

# En una terminal, ejecuta la app
npm run dev

# En otra terminal, crea el túnel
ngrok http 5173
```

Copia la URL de ngrok (https://xxx.ngrok.io) y ábrela en tu móvil.

### Opción 2: Red local

1. Ejecuta `npm run dev -- --host`
2. Busca la IP de tu computadora (ej: 192.168.1.5)
3. En tu móvil, abre `http://192.168.1.5:5173`

---

## 🏗️ Build para producción

```bash
# Build
npm run build

# Preview del build
npm run preview
```

Los archivos estarán en `dist/`

---

## 🚀 Despliegue

### Vercel (Recomendado - Gratis)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel
```

### Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Desplegar
netlify deploy --prod --dir=dist
```

### Otros (Railway, Render, etc.)

1. Conecta tu repo de GitHub
2. Configura las variables de entorno
3. Build command: `npm run build`
4. Output directory: `dist`

---

## 🐛 Troubleshooting

### Error: "Supabase credentials missing"

- Verifica que `.env` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo (`Ctrl+C` y `npm run dev`)

### Error: "Gemini API key missing"

- Asegúrate de que tu API key es válida
- Algunas features funcionarán en modo limitado sin la API key

### La PWA no se instala

- Asegúrate de estar usando HTTPS (ngrok, o producción)
- Chrome DevTools > Application > Manifest debe mostrar sin errores

### Errores de TypeScript

```bash
# Limpiar cache
rm -rf node_modules
npm install

# Verificar tipos
npm run build
```

---

## 📚 Próximos Pasos

1. **Personaliza los colores**: Edita `tailwind.config.js`
2. **Añade más features**: Los componentes están en `src/features/`
3. **Mejora la IA**: Ajusta los prompts en `src/services/gemini.ts`
4. **Analytics**: Integra PostHog, Mixpanel, etc.
5. **Monetización**: Añade Stripe para subscripciones premium

---

## 🤝 ¿Necesitas ayuda?

- **Documentación Supabase**: https://supabase.com/docs
- **Documentación Gemini**: https://ai.google.dev/docs
- **PWA Docs**: https://web.dev/progressive-web-apps/

---

¡Disfruta construyendo! 🎉
