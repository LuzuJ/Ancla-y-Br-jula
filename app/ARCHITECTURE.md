# 📐 Arquitectura del Proyecto - Ancla y Brújula

## 🏗️ Diseño en Capas (Layered Architecture)

Este proyecto sigue una **arquitectura de 4 capas** basada en principios de Clean Architecture, separando responsabilidades y facilitando el mantenimiento y escalabilidad.

```
app/src/
├── presentation/          # 🎨 CAPA DE PRESENTACIÓN
│   ├── screens/          # Pantallas principales de la aplicación
│   │   ├── ancla/        # Ejercicio de respiración (4-4-4-4)
│   │   ├── auth/         # Login y Onboarding
│   │   ├── bitacora/     # Diario emocional
│   │   ├── boveda/       # Bóveda de autoestima
│   │   ├── brujula/      # Contenido diario curado
│   │   ├── espejo/       # Chat TCC con Ancla
│   │   └── perfil/       # Perfil y configuración
│   └── components/       # Componentes reutilizables (futuro)
│
├── application/          # 🧠 CAPA DE APLICACIÓN
│   ├── store/           # Estado global (Zustand)
│   │   └── index.ts     # Stores: Auth, Journal, Vault, Chat, Content
│   └── hooks/           # Custom React Hooks (futuro)
│
├── domain/              # 📦 CAPA DE DOMINIO
│   ├── models/          # Tipos e Interfaces TypeScript
│   │   └── index.ts     # User, JournalEntry, VaultEntry, ChatMessage, etc.
│   └── constants/       # Constantes de negocio
│       └── index.ts     # EMERGENCY_CONTACTS, MOODS, VAULT_CATEGORIES, etc.
│
└── infrastructure/      # 🔌 CAPA DE INFRAESTRUCTURA
    ├── api/            # Servicios externos
    │   ├── supabase.ts  # Cliente y servicios de Supabase
    │   └── gemini.ts    # Cliente y lógica TCC de Gemini AI
    ├── database/       # Almacenamiento local
    │   └── offline.ts   # IndexedDB para offline-first
    └── config/         # Configuración
        └── environment.ts # Variables de entorno
```

---

## 📚 Descripción de las Capas

### 1️⃣ **Presentation Layer** (Capa de Presentación)
**Responsabilidad:** Interfaz de usuario y experiencia del usuario.

- **Screens:** Pantallas completas de la aplicación
  - Cada screen es un componente React autónomo
  - Maneja la lógica de UI y eventos locales
  - Consume datos del Application Layer (stores)
  
- **Components:** Componentes reutilizables (botones, cards, modales, etc.)
  - Componentes "tontos" sin lógica de negocio
  - Reciben props y renderan UI

**Principio:** Esta capa NO debe conocer detalles de infraestructura (APIs, base de datos).

---

### 2️⃣ **Application Layer** (Capa de Aplicación)
**Responsabilidad:** Lógica de aplicación y orquestación.

- **Store:** Estado global con Zustand
  - `AuthStore`: Autenticación, usuario actual
  - `JournalStore`: Entradas del diario emocional
  - `VaultStore`: Evidencias de autoestima
  - `ChatStore`: Historial de conversación con Ancla
  - `ContentStore`: Contenido diario curado
  - `SettingsStore`: Configuración de la app

- **Hooks:** (Futuro) Custom hooks para lógica reutilizable
  - `useSync`: Hook para sincronización offline/online
  - `useBreathing`: Lógica del ejercicio de respiración

**Principio:** Orquesta el flujo de datos entre Presentation e Infrastructure.

---

### 3️⃣ **Domain Layer** (Capa de Dominio)
**Responsabilidad:** Lógica de negocio pura, sin dependencias externas.

- **Models:** Tipos e interfaces de TypeScript
  ```typescript
  export interface User {
    id: string;
    email: string;
    created_at: Date;
  }
  
  export interface JournalEntry {
    id: string;
    user_id: string;
    date: string;
    emotion: 'calm' | 'happy' | 'anxious' | 'sad' | 'angry' | 'mixed';
    intensity: 1 | 2 | 3 | 4 | 5;
    content: string;
  }
  ```

- **Constants:** Valores y configuraciones de negocio
  ```typescript
  export const EMERGENCY_CONTACTS = [
    { name: 'Línea de la Vida', phone: '800 911 2000' },
    ...
  ];
  
  export const MOODS = [
    { value: 'calm', emoji: '😌', color: '#4fd1c5' },
    ...
  ];
  ```

**Principio:** Esta capa es el corazón de la aplicación. No depende de nada más.

---

### 4️⃣ **Infrastructure Layer** (Capa de Infraestructura)
**Responsabilidad:** Comunicación con servicios externos y almacenamiento.

- **API:**
  - `supabase.ts`: CRUD operations con Supabase (PostgreSQL)
    - `authService`: Login, signup, signout
    - `journalService`: Gestión de entradas del diario
    - `vaultService`: Gestión de evidencias de autoestima
    - `chatService`: Historial de chat con Ancla
    - `contentService`: Contenido diario curado
  
  - `gemini.ts`: Integración con Google Gemini AI
    - `anclaChat`: Clase para conversaciones TCC
    - `detectDistortions()`: Detecta distorsiones cognitivas
    - `detectTriggers()`: Detecta triggers emocionales
    - `generateBreathingGuide()`: Genera guías de respiración
    - `generateDailyContent()`: Genera contenido diario

- **Database:**
  - `offline.ts`: IndexedDB para offline-first
    - `offlineJournal`, `offlineVault`, `offlineChat`, `offlineContent`
    - `syncWithSupabase()`: Sincronización con Supabase cuando hay conexión

- **Config:**
  - `environment.ts`: Variables de entorno
    - `ENV.SUPABASE_URL`, `ENV.GEMINI_API_KEY`, etc.
    - `validateEnvironment()`: Valida que todas las variables estén presentes

**Principio:** Esta capa puede ser reemplazada sin afectar las capas superiores.

---

## 🔄 Flujo de Datos

```
┌─────────────────┐
│  Presentation   │  ← Usuario interactúa con la UI
│   (Screens)     │
└────────┬────────┘
         │ usa
         ▼
┌─────────────────┐
│  Application    │  ← Lee/Escribe estado global
│    (Stores)     │
└────────┬────────┘
         │ usa
         ▼
┌─────────────────┐
│ Infrastructure  │  ← Llama APIs y DB
│   (Services)    │
└────────┬────────┘
         │ retorna
         ▼
┌─────────────────┐
│     Domain      │  ← Tipos y modelos
│    (Models)     │
└─────────────────┘
```

**Ejemplo de flujo:**

1. **Usuario** crea una entrada de diario en `Bitacora.tsx` (Presentation)
2. **Bitacora** llama a `useJournalStore().addEntry()` (Application)
3. **JournalStore** llama a `journalService.createEntry()` (Infrastructure)
4. **journalService** guarda en Supabase y retorna `JournalEntry` (Domain)
5. **JournalStore** actualiza el estado
6. **Bitacora** se re-renderiza automáticamente con la nueva entrada

---

## 🎯 Principios de Diseño

### ✅ Separation of Concerns
Cada capa tiene una responsabilidad clara y no se mezcla con otras.

### ✅ Dependency Rule
**Las dependencias apuntan hacia adentro:**
- Presentation → Application → Domain
- Infrastructure → Domain

**El Domain Layer NO depende de nadie.**

### ✅ Testability
Cada capa puede ser testeada independientemente:
- Domain: Tests unitarios puros
- Application: Mock de servicios
- Infrastructure: Tests de integración
- Presentation: Tests de componentes

### ✅ Scalability
Fácil agregar nuevas features:
- Nueva pantalla → `presentation/screens/nueva/`
- Nuevo servicio → `infrastructure/api/nuevo.ts`
- Nuevo modelo → `domain/models/` + nueva interface

---

## 📖 Convenciones

### Imports
Siempre usar el alias `@/` para imports absolutos:

```typescript
// ✅ Correcto
import { useAuthStore } from '@/application/store';
import { EMERGENCY_CONTACTS } from '@/domain/constants';
import { supabase } from '@/infrastructure/api/supabase';

// ❌ Incorrecto (imports relativos)
import { useAuthStore } from '../../../application/store';
```

### Naming
- **Screens:** PascalCase (`Espejo.tsx`, `Bitacora.tsx`)
- **Services:** camelCase (`authService`, `journalService`)
- **Constants:** UPPER_SNAKE_CASE (`EMERGENCY_CONTACTS`, `MOODS`)
- **Types:** PascalCase (`User`, `JournalEntry`)

### File Structure
- Un archivo por componente/servicio
- Archivos agrupados por feature en `presentation/screens/`
- Servicios agrupados por tipo en `infrastructure/api/` y `infrastructure/database/`

---

## 🚀 Beneficios de esta Arquitectura

1. **Mantenibilidad:** Fácil encontrar dónde está cada cosa
2. **Escalabilidad:** Agregar features sin romper lo existente
3. **Testabilidad:** Cada parte puede testearse aisladamente
4. **Reutilización:** Los servicios pueden usarse en múltiples pantallas
5. **Onboarding:** Nuevos desarrolladores entienden rápido la estructura
6. **Debuggability:** Problemas aislados a capas específicas

---

## 📝 Migraciones Future

### Componentes Compartidos
Extraer componentes comunes a `presentation/components/`:
- `Button.tsx`
- `Card.tsx`
- `Modal.tsx`
- `Input.tsx`

### Custom Hooks
Mover lógica reutilizable a `application/hooks/`:
- `useSync.ts`: Sincronización offline/online
- `useBreathing.ts`: Estados del ejercicio de respiración
- `useEmergency.ts`: Manejo de emergencias

### Servicios Adicionales
Agregar más servicios en `infrastructure/`:
- `api/analytics.ts`: Tracking de eventos
- `api/notifications.ts`: Push notifications
- `storage/secure.ts`: Almacenamiento encriptado

---

**Pregunta:** ¿Por qué esta arquitectura en lugar de MVC o MVVM?

**Respuesta:** Clean Architecture/Layered es más flexible que MVC para aplicaciones React:
- MVC mezcla lógica de negocio con controladores
- MVVM tiene ViewModels que pueden volverse gigantes
- Layered separa claramente UI, lógica, y datos
- Permite offline-first con IndexedDB sin cambiar las pantallas

✨ **Esta arquitectura nos permite escalar de 1,000 a 100,000 usuarios sin reescribir código.**
