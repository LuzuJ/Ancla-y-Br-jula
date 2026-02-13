# 📧 Configuración de Emails en Supabase

## 🔍 Problema: No llegan los emails de confirmación

Hay dos posibles causas:

### 1. **Supabase no tiene configurado un proveedor de email** (Más probable)

Por defecto, Supabase usa un servicio de email de prueba que tiene límites muy estrictos y los emails pueden NO llegar o ir directo a spam.

### 2. **La confirmación de email está activada pero sin configurar correctamente**

---

## ✅ SOLUCIÓN RÁPIDA PARA DESARROLLO

### Opción A: Desactivar confirmación de email temporalmente

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/qztbcdabtxkxrytdoeky
2. Ve a **Authentication** → **Settings** (o URL directa: https://supabase.com/dashboard/project/qztbcdabtxkxrytdoeky/auth/settings)
3. Busca la sección **"Email"**
4. Encuentra **"Enable email confirmations"**
5. **DESACTÍVALO** (toggle OFF)
6. Guarda los cambios

**⚠️ IMPORTANTE:** Esto es SOLO para desarrollo. En producción, DEBES tener confirmación de email activada.

---

## 🔧 SOLUCIÓN PARA PRODUCCIÓN

### Configurar un proveedor de email real

Supabase soporta varios proveedores. Los más simples:

#### **1. SendGrid (Recomendado - Gratis hasta 100 emails/día)**

1. Crea cuenta en https://sendgrid.com/
2. Genera una API Key
3. En Supabase → Authentication → Settings → Email Provider
4. Selecciona "SendGrid"
5. Pega tu API Key
6. Configura el email remitente (debe estar verificado)

#### **2. Resend (Muy simple - 100 emails/día gratis)**

1. Crea cuenta en https://resend.com/
2. Genera una API Key
3. En Supabase → Authentication → Settings → Email Provider
4. Selecciona "Resend"
5. Pega tu API Key

#### **3. SMTP Custom (Gmail, Outlook, etc.)**

1. En Supabase → Authentication → Settings → Email Provider
2. Selecciona "Custom SMTP"
3. Configura:
   - Host (ej: smtp.gmail.com)
   - Port (465 o 587)
   - Username (tu email)
   - Password (usa App Password si es Gmail)
   - Sender Email
   - Sender Name

---

## 📨 Verificar si los emails se están enviando

1. Ve a **Authentication** → **Logs** en tu dashboard de Supabase
2. Busca eventos de tipo "signup" o "email"
3. Revisa si hay errores relacionados con email

---

## 🧪 Probar el flujo completo

### Con confirmación desactivada:
1. Regístrate con un nuevo email
2. Deberías entrar directo a la app
3. Funciona sin confirmación

### Con confirmación activada + email configurado:
1. Regístrate con un nuevo email
2. Deberías ver el mensaje: "📧 Te hemos enviado un email de confirmación"
3. Revisa tu bandeja (y SPAM)
4. Haz clic en el link de confirmación
5. Vuelve a la app e inicia sesión
6. ✅ Ahora sí funciona

---

## 🎯 Recomendación

**Para desarrollo ahora mismo:**
- Desactiva confirmación de email
- Podrás probar la app sin problemas

**Para antes de lanzar en producción:**
- Configura SendGrid o Resend (ambos gratis para volumen bajo)
- Reactiva confirmación de email
- Prueba el flujo completo

---

## 📝 Notas sobre el código

El código ya está preparado para manejar correctamente ambos escenarios:

- ✅ Si confirmación está desactivada → Entra directo
- ✅ Si confirmación está activada → Muestra mensaje y botón de reenvío
- ✅ Maneja errores de email no confirmado
- ✅ Permite reenviar email de confirmación
- ✅ Cierra sesiones temporales no confirmadas

---

## 🆘 Troubleshooting

### "No recibo el email después de configurar el proveedor"
- Revisa tu carpeta de SPAM
- Verifica que el email remitente esté verificado en el proveedor
- Revisa los logs en Supabase Authentication → Logs

### "El email llega pero el link no funciona"
- Verifica que la URL de tu app esté configurada en:
  - Supabase → Authentication → URL Configuration
  - Site URL debe ser: http://localhost:5173 (desarrollo) o tu dominio (producción)
  - Redirect URLs debe incluir tu dominio

### "Quiero que los usuarios confirmen por código en vez de link"
- Supabase también soporta OTP (códigos de 6 dígitos)
- Sería necesario modificar el código para usar `verifyOtp()` en vez de links

---

## 📚 Documentación oficial

- Supabase Auth: https://supabase.com/docs/guides/auth
- Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates
- SMTP Config: https://supabase.com/docs/guides/auth/auth-smtp
