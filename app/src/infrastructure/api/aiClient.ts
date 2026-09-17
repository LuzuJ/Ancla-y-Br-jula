import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatMessage, CognitiveDistortion, DailyContent } from '@/domain/models';
import { useSettingsStore } from '@/application/store';

// ============= HELPER TO GET AI INSTANCE =============
function getGenAI() {
  const { aiApiKey } = useSettingsStore.getState();
  if (!aiApiKey) throw new Error('API_KEY_MISSING');
  return new GoogleGenerativeAI(aiApiKey);
}

// ============= ANCLA TCC SYSTEM PROMPT =============
const ANCLA_SYSTEM_PROMPT = `### ROL
Eres "Ancla", un asistente de acompañamiento emocional basado en principios de Terapia Cognitivo-Conductual (TCC). NO eres un médico, ni un psiquiatra. Tu objetivo es ayudar al usuario a reestructurar pensamientos negativos y gestionar crisis de ansiedad mediante la lógica, la empatía y la evidencia.

### TONO Y PERSONALIDAD
- Empático pero firme: Validas la emoción ("Entiendo que te sientas así..."), pero cuestionas la lógica del pensamiento negativo ("...pero, ¿tenemos evidencia de que eso sea 100% real?").
- Paciente: Nunca te frustras si el usuario es repetitivo.
- Lógico: Usas preguntas socráticas para desmontar distorsiones cognitivas.

### REGLAS DE INTERACCIÓN

1. FASE DE VALIDACIÓN (Siempre empieza aquí):
   - Nunca contradigas al usuario de entrada.
   - Ejemplo: Si dice "Soy un fracaso", responde: "Siento mucho que te sientas así en este momento. Parece que ha sido un día duro."

2. FASE DE CUESTIONAMIENTO (Reestructuración Cognitiva):
   - Una vez validado, busca la distorsión cognitiva (Generalización, Pensamiento Todo/Nada, Catastrofismo).
   - Haz una pregunta que obligue al usuario a buscar "pruebas" contrarias.
   - Ejemplo: "¿El hecho de que fallaras hoy en X, anula todas las veces que acertaste en Y?"

3. USO DE "LA BÓVEDA" (Autoestima):
   - Si detectas frases de autodesprecio profundo ("no valgo nada", "nadie me quiere", "soy un estorbo"), NO discutas.
   - Activa el disparador de la Bóveda.
   - Tu respuesta debe ser corta e invitar a ver la evidencia.
   - Output requerido al final: [TRIGGER_VAULT]

4. PROTOCOLO DE ANSIEDAD (Grounding):
   - Si detectas: respiración agitada, frases cortas, miedo inminente, "me voy a morir", "no puedo respirar".
   - ABORTA el cuestionamiento lógico. La lógica no funciona en el pánico.
   - Pasa a instrucciones directas, cortas y sensoriales.
   - Output requerido al inicio: [TRIGGER_PANIC_MODE]
   - Ejemplo de respuesta: "Estás a salvo. Estoy aquí. No necesitamos hablar ahora. Solo respira conmigo. Mira la pantalla."

### REGLAS DE SEGURIDAD (CRÍTICO)
- Si el usuario menciona explícitamente suicidio, autolesiones o planes de hacerse daño:
   1. Deja de actuar como terapeuta.
   2. Responde con urgencia y calidez, proporcionando recursos de ayuda inmediata.
   3. Output requerido al inicio: [TRIGGER_EMERGENCY_CONTACT]

### IMPORTANTE
- SIEMPRE responde en español.
- Mantén las respuestas BREVES (máximo 3-4 frases).
- Usa los triggers EXACTAMENTE como se muestra: [TRIGGER_VAULT], [TRIGGER_PANIC_MODE], [TRIGGER_EMERGENCY_CONTACT]
`;

// ============= DISTORTION DETECTOR =============
export function detectDistortions(text: string): CognitiveDistortion[] {
  const distortions: CognitiveDistortion[] = [];

  if (/(siempre|nunca|todo|todos|nadie|nada)/i.test(text)) distortions.push('generalization');
  if (/(perfecto|completamente|totalmente|100%|absolutamente)/i.test(text)) distortions.push('all-or-nothing');
  if (/(voy a morir|me voy a morir|es el fin|todo está perdido|desastre|terrible|horrible)/i.test(text)) distortions.push('catastrophizing');
  if (/(no valgo|soy un estorbo|soy un fracaso|no sirvo|soy inútil|no merezco)/i.test(text)) distortions.push('self-deprecation');
  if (/(va a salir mal|sé que|seguro que|va a pasar)/i.test(text)) distortions.push('fortune-telling');
  if (/(todos piensan|me juzgan|creen que soy|piensan que)/i.test(text)) distortions.push('mind-reading');

  return [...new Set(distortions)];
}

// ============= TRIGGER DETECTOR =============
export function detectTriggers(text: string): ChatMessage['trigger'] | null {
  if (/(suicid|suicidio|matarme|hacerme daño|terminar con todo|no quiero vivir)/i.test(text)) return 'EMERGENCY_CONTACT';
  if (/(no puedo respirar|me ahogo|me voy a morir|pecho|corazón late|pánico|ataque)/i.test(text)) return 'PANIC_MODE';
  if (/(no valgo|nadie me quiere|soy un estorbo|no merezco|soy basura)/i.test(text)) return 'VAULT';
  return null;
}

// ============= NVIDIA NIM / OPENAI GENERIC CLIENT =============
export const VALID_GENERIC_MODELS = [
  'deepseek-ai/deepseek-v4-flash-0731',
  'mistralai/mistral-nemotron',
  'openai/gpt-oss-20b'
];
export const DEFAULT_GENERIC_MODEL = 'deepseek-ai/deepseek-v4-flash-0731';

async function fetchGenericAI(
  systemPrompt: string, 
  userPrompt: string, 
  history: {role: string, content: string}[] = [],
  overrideModel?: string
): Promise<string> {
  const { aiApiKey, aiModel } = useSettingsStore.getState();
  if (!aiApiKey) throw new Error('API_KEY_MISSING');
  
  const targetModel = (overrideModel && VALID_GENERIC_MODELS.includes(overrideModel))
    ? overrideModel
    : (VALID_GENERIC_MODELS.includes(aiModel) ? aiModel : DEFAULT_GENERIC_MODEL);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userPrompt }
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('/api/nim/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiApiKey.trim()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: targetModel,
        messages,
        temperature: 0.8,
        top_p: 0.95,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error('RATE_LIMIT');
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchGenericAIStream(
  systemPrompt: string,
  userPrompt: string,
  history: { role: string; content: string }[] = [],
  onChunk?: (chunk: string, fullText: string) => void,
  overrideModel?: string
): Promise<string> {
  const { aiApiKey, aiModel } = useSettingsStore.getState();
  if (!aiApiKey) throw new Error('API_KEY_MISSING');

  const targetModel = (overrideModel && VALID_GENERIC_MODELS.includes(overrideModel))
    ? overrideModel
    : (VALID_GENERIC_MODELS.includes(aiModel) ? aiModel : DEFAULT_GENERIC_MODEL);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userPrompt }
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('/api/nim/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiApiKey.trim()}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: targetModel,
        messages,
        temperature: 0.8,
        top_p: 0.95,
        max_tokens: 1000,
        stream: true
      })
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error('RATE_LIMIT');
      throw new Error(`API Error: ${response.status}`);
    }

    if (!response.body) throw new Error('ReadableStream not supported');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.replace(/^data:\s*/, '');
        if (dataStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullText += delta;
            if (onChunk) onChunk(delta, fullText);
          }
        } catch (e) {
          // Skip malformed chunk
        }
      }
    }

    return fullText;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============= ANCLA CHAT SERVICE =============
class AnclaChat {
  private geminiChat: any = null;
  private genericHistory: {role: string, content: string}[] = [];
  
  private currentApiKey: string | null = null;
  private currentModelName: string | null = null;
  private currentProvider: string | null = null;

  private initChat() {
    const { aiApiKey, aiModel, aiProvider } = useSettingsStore.getState();
    
    // Reset if config changed
    if (this.currentApiKey !== aiApiKey || this.currentModelName !== aiModel || this.currentProvider !== aiProvider) {
      this.geminiChat = null;
      this.genericHistory = [];
      
      this.currentApiKey = aiApiKey;
      this.currentModelName = aiModel;
      this.currentProvider = aiProvider;
    }

    if (this.currentProvider === 'gemini' && !this.geminiChat) {
      if (!aiApiKey) throw new Error('API_KEY_MISSING');
      const genAI = new GoogleGenerativeAI(aiApiKey);
      const model = genAI.getGenerativeModel({
        model: aiModel || 'gemini-2.5-flash',
        systemInstruction: ANCLA_SYSTEM_PROMPT,
      });
      this.geminiChat = model.startChat({
        history: [],
        generationConfig: { temperature: 0.8, topP: 0.95, topK: 40, maxOutputTokens: 1500 },
      });
    }
  }

  async sendMessage(
    userMessage: string,
    onChunk?: (chunk: string, fullText: string) => void
  ): Promise<{
    response: string;
    trigger: ChatMessage['trigger'] | null;
    distortions: CognitiveDistortion[];
  }> {
    try {
      this.initChat();
      const { aiProvider } = useSettingsStore.getState();
      
      const trigger = detectTriggers(userMessage);
      const distortions = detectDistortions(userMessage);
      
      let responseText = '';

      if (aiProvider === 'generic') {
        responseText = await fetchGenericAIStream(ANCLA_SYSTEM_PROMPT, userMessage, this.genericHistory, onChunk);
        this.genericHistory.push({ role: 'user', content: userMessage });
        this.genericHistory.push({ role: 'assistant', content: responseText });
      } else {
        const result = await this.geminiChat.sendMessage(userMessage);
        responseText = result.response.text();
        if (onChunk) onChunk(responseText, responseText);
      }

      let detectedTrigger = trigger;
      if (responseText.includes('[TRIGGER_VAULT]')) detectedTrigger = 'VAULT';
      else if (responseText.includes('[TRIGGER_PANIC_MODE]')) detectedTrigger = 'PANIC_MODE';
      else if (responseText.includes('[TRIGGER_EMERGENCY_CONTACT]')) detectedTrigger = 'EMERGENCY_CONTACT';

      const cleanResponse = responseText
        .replace(/\[TRIGGER_VAULT\]/g, '')
        .replace(/\[TRIGGER_PANIC_MODE\]/g, '')
        .replace(/\[TRIGGER_EMERGENCY_CONTACT\]/g, '')
        .trim();

      return {
        response: cleanResponse,
        trigger: detectedTrigger,
        distortions
      };
    } catch (error: any) {
      console.error('Ancla chat error:', error);
      let errorMessage = 'Lo siento, el espejo se ha empañado un momento.';
      if (error?.message === 'API_KEY_MISSING' || error?.message?.includes('API key')) {
        errorMessage = '⚠️ Configura tu API Key en la pantalla de Perfil para usar el chat.';
      } else if (error?.message === 'RATE_LIMIT' || error?.status === 429) {
        errorMessage = 'Límite de solicitudes alcanzado. Espera un momento.';
      }
      return { response: errorMessage, trigger: null, distortions: [] };
    }
  }

  resetChat() {
    this.geminiChat = null;
    this.genericHistory = [];
  }
}

export const anclaChat = new AnclaChat();

// ============= GRANULAR GENERATORS FOR BRÚJULA =============
export async function generateSingleQuoteWithAi(): Promise<{ quote: string; author: string } | null> {
  try {
    const prompt = `Genera UNA sola cita breve y serena de filosofía estoica o budista para calmar la mente.
Responde SOLO con formato JSON: {"quote": "texto de la cita", "author": "Nombre Autor"}`;
    const text = await generateContentWithProvider(prompt, 'gemini-2.5-flash', 'deepseek-ai/deepseek-v4-flash-0731');
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    return { quote: parsed.quote, author: parsed.author };
  } catch (err) {
    console.error('Single quote generation error:', err);
    return null;
  }
}

export async function generateSingleMicroActionWithAi(): Promise<string | null> {
  try {
    const prompt = `Genera UNA sola micro-acción psicológica de máximo 30 palabras basada en TCC o Mindfulness para hacer hoy en 2 minutos (ej. grounding, respiración, defusión cognitiva).
Devuelve SOLO el texto de la acción sin comillas ni títulos.`;
    const text = await generateContentWithProvider(prompt, 'gemini-2.5-flash', 'deepseek-ai/deepseek-v4-flash-0731');
    return text.trim();
  } catch (err) {
    console.error('Single micro action generation error:', err);
    return null;
  }
}

export async function generateSinglePoemWithAi(): Promise<{ title: string; author: string; text: string } | null> {
  try {
    const prompt = `Genera UN poema corto sobre calma y esperanza de máximo 45 palabras.
Responde SOLO con formato JSON: {"title": "Título", "author": "Autor", "text": "Texto del poema"}`;
    const text = await generateContentWithProvider(prompt, 'gemini-2.5-flash', 'deepseek-ai/deepseek-v4-flash-0731');
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch (err) {
    console.error('Single poem generation error:', err);
    return null;
  }
}

// ============= FULL GENERATORS =============
async function generateContentWithProvider(prompt: string, defaultGeminiModel: string, defaultGenericModel: string): Promise<string> {
  const { aiProvider, aiModel } = useSettingsStore.getState();
  
  if (aiProvider === 'generic') {
    return fetchGenericAI('Eres un asistente útil y empático.', prompt, [], defaultGenericModel);
  } else {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: aiModel || defaultGeminiModel });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }
}

export async function generateDailyContent(): Promise<DailyContent | null> {
  try {
    const prompt = `Actúa como curador de arte y filósofo. Genera contenido de bienestar:
1. UNA CITA ESTOICA real (incluye autor).
2. UNA MICRO-ACCIÓN psicológica (ej. Grounding).
3. TRES canciones sobre 'calma interior' (Título - Artista reales).
4. DOS pinturas que evoquen paz (Título - Artista).
5. UN poema corto (máx 60 palabras) sobre esperanza.

RESPONDE SOLO CON ESTE FORMATO JSON:
{
  "quote": "cita", "author": "autor", "micro_action": "acción",
  "songs": [{"title": "título", "artist": "artista"}],
  "art": [{"title": "título", "artist": "artista"}],
  "poem": {"title": "título", "author": "autor", "text": "texto"}
}`;

    const text = await generateContentWithProvider(prompt, 'gemini-2.5-flash', 'deepseek-ai/deepseek-v4-flash-0731');
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      id: '',
      date: new Date().toISOString().split('T')[0],
      quote: parsed.quote,
      author: parsed.author,
      micro_action: parsed.micro_action,
      curated_songs: parsed.songs || [],
      curated_art: parsed.art || [],
      poem: parsed.poem,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Daily content error:', error);
    return null;
  }
}

export async function getWelcomePhrase(): Promise<string> {
  try {
    return await generateContentWithProvider(
      'Genera UNA frase corta de bienvenida para una app de bienestar emocional. Máx 10 palabras. Sin comillas. En español.',
      'gemini-2.5-flash',
      'deepseek-ai/deepseek-v4-flash-0731'
    );
  } catch (error) {
    return 'Tu espacio de calma interior';
  }
}

export async function generateBreathingGuide(): Promise<string> {
  try {
    const prompt = `Genera una guía breve de respiración 4-4-4-4 (inhala 4, retén 4, exhala 4, retén 4).
Usa lenguaje calmado, presente, en segunda persona.
Máximo 50 palabras.
No uses asteriscos ni formato markdown.
Ejemplo: "Inhala profundamente por la nariz... dos... tres... cuatro. Retén el aire, siente la calma. Exhala lentamente por la boca, liberando tensión. Retén en el vacío, estás a salvo."`;

    return await generateContentWithProvider(prompt, 'gemini-2.5-flash', 'deepseek-ai/deepseek-v4-flash-0731');
  } catch (error) {
    console.error('Breathing guide error:', error);
    return 'Inhala profundamente... dos... tres... cuatro. Retén el aire. Exhala suavemente... liberando tensión. Retén. Estás a salvo.';
  }
}

export async function generateSelfWorthPoem(): Promise<string> {
  try {
    const prompt = `Escribe un poema en prosa muy corto (máx 60 palabras) dirigido a alguien que siente que "no es suficiente". 
Tono cálido, cercano, no condescendiente. 
Sin asteriscos ni formato markdown.
En español.`;

    return await generateContentWithProvider(prompt, 'gemini-2.5-flash', 'mistralai/mistral-nemotron');
  } catch (error) {
    console.error('Poem generation error:', error);
    return 'Eres suficiente tal como eres. No necesitas ser más ni menos. Tu existencia tiene valor por sí misma.';
  }
}
