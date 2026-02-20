# Configuración de DeepSeek AI

## ¿Por qué DeepSeek?

DeepSeek ofrece:
- ✅ **Cuota gratuita generosa**: 10M tokens gratis
- ✅ **Compatible con OpenAI**: API estándar de la industria
- ✅ **Sin límites de 20 RPD**: Mayor flexibilidad que Gemini
- ✅ **Excelente calidad**: Modelos de última generación

## Obtener tu API Key

1. Ve a [https://platform.deepseek.com](https://platform.deepseek.com)
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys** en el menú
4. Haz clic en **Create API Key**
5. Copia la clave generada (comienza con `sk-`)

## Configuración en el proyecto

1. Abre el archivo `.env` en la carpeta `/app`
2. Reemplaza el valor de `VITE_DEEPSEEK_API_KEY`:

```env
VITE_DEEPSEEK_API_KEY=tu-api-key-aqui
```

3. Guarda el archivo
4. Reinicia el servidor de desarrollo:

```bash
npm run dev
```

## Verificación

Para verificar que todo funciona:

1. Abre la app en el navegador
2. Ve a la sección **Espejo** (chat con Ancla)
3. Envía un mensaje de prueba
4. Deberías recibir una respuesta del asistente TCC

## Características de la integración

La implementación actual usa DeepSeek para:

- 🗣️ **Chat TCC (Ancla)**: Conversaciones terapéuticas con detección de distorsiones cognitivas
- 📅 **Contenido diario**: Citas estoicas, micro-acciones, música, arte y poemas
- 🌬️ **Guías de respiración**: Instrucciones personalizadas de grounding
- 💎 **Poemas de autoestima**: Contenido generado para La Bóveda
- 👋 **Frases de bienvenida**: Mensajes personalizados en onboarding

## Modelo utilizado

- **`deepseek-chat`**: Modelo conversacional optimizado
- **Compatible con OpenAI**: Usa el mismo formato de API
- **Parámetros**: Temperature 0.8, max_tokens 1500

## Límites y cuotas

DeepSeek ofrece:
- **Plan gratuito**: 10M tokens/mes
- **Sin límite de RPD**: No hay restricción de 20 requests/día como Gemini
- **Precio bajo**: Si necesitas más, el costo es muy accesible

## Migración desde Gemini

Si estabas usando Gemini antes:

1. ✅ El sistema prompt TCC se mantiene idéntico
2. ✅ La detección de triggers funciona igual
3. ✅ Los detectores de distorsiones cognitivas no cambian
4. ✅ Solo cambia el proveedor de API (de Google a DeepSeek)

## Soporte

Si tienes problemas:

1. Verifica que la API key esté correcta en `.env`
2. Revisa la consola del navegador (F12) para ver errores
3. Confirma que el servidor se reinició después de cambiar `.env`
4. Verifica que tengas cuota disponible en [platform.deepseek.com](https://platform.deepseek.com)

---

**¡Listo!** Tu app ahora usa DeepSeek con mejor cuota y sin límites diarios restrictivos. 🚀
