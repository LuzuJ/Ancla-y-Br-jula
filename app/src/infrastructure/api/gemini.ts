import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatMessage, CognitiveDistortion, DailyContent } from '@/domain/models';
import { ENV } from '@/infrastructure/config/environment';

const API_KEY = ENV.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('⚠️ Gemini API key missing. AI features will be limited.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

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

### EJEMPLOS DE FLUJO

Usuario: "Todo me sale mal. Siempre arruino todo."
Ancla: "Es agotador sentir que nada funciona, te entiendo. Pero cuando dices 'siempre', ¿es una sensación o un hecho? ¿Hubo algo, por pequeño que sea, que no saliera mal hoy?"

Usuario: "Siento que me ahogo, el pecho me duele, no puedo parar."
Ancla: [TRIGGER_PANIC_MODE] "Estás teniendo un ataque de ansiedad. No te vas a morir. Es solo miedo y va a pasar. Vamos a anclarnos. Dime 5 cosas azules que veas ahora mismo."

Usuario: "No valgo nada, nadie me quiere, soy un estorbo."
Ancla: "Entiendo que en este momento sientes que no vales, y eso duele mucho. Pero antes de creer eso como un hecho absoluto, ¿podríamos revisar juntos la evidencia? Cuéntame: ¿alguna vez alguien te ha dicho lo contrario? ¿Has hecho algo por alguien que demuestre que sí importas? [TRIGGER_VAULT]"

Usuario: "Quiero desaparecer, ya no aguanto más, he pensado en hacerme daño."
Ancla: [TRIGGER_EMERGENCY_CONTACT] "Escúchame con atención: lo que estás sintiendo es real, pero no estás solo/a en esto. Por favor, necesitas hablar con alguien que pueda ayudarte ahora mismo. Voy a mostrarte líneas de ayuda profesional que están disponibles 24/7. Tu vida importa, y hay personas preparadas para ayudarte en este momento."

### IMPORTANTE
- SIEMPRE responde en español.
- Mantén las respuestas BREVES (máximo 3-4 frases).
- Usa los triggers EXACTAMENTE como se muestra: [TRIGGER_VAULT], [TRIGGER_PANIC_MODE], [TRIGGER_EMERGENCY_CONTACT]
`;

// ============= DISTORTION DETECTOR =============
export function detectDistortions(text: string): CognitiveDistortion[] {
  const distortions: CognitiveDistortion[] = [];

  // Generalization keywords
  if (/(siempre|nunca|todo|todos|nadie|nada)/i.test(text)) {
    distortions.push('generalization');
  }

  // All-or-nothing keywords
  if (/(perfecto|completamente|totalmente|100%|absolutamente)/i.test(text)) {
    distortions.push('all-or-nothing');
  }

  // Catastrophizing
  if (/(voy a morir|me voy a morir|es el fin|todo está perdido|desastre|terrible|horrible)/i.test(text)) {
    distortions.push('catastrophizing');
  }

  // Self-deprecation
  if (/(no valgo|soy un estorbo|soy un fracaso|no sirvo|soy inútil|no merezco)/i.test(text)) {
    distortions.push('self-deprecation');
  }

  // Fortune-telling
  if (/(va a salir mal|sé que|seguro que|va a pasar)/i.test(text)) {
    distortions.push('fortune-telling');
  }

  // Mind-reading
  if (/(todos piensan|me juzgan|creen que soy|piensan que)/i.test(text)) {
    distortions.push('mind-reading');
  }

  return [...new Set(distortions)];
}

// ============= TRIGGER DETECTOR =============
export function detectTriggers(text: string): ChatMessage['trigger'] | null {

  // Emergency keywords
  if (/(suicid|suicidio|matarme|hacerme daño|terminar con todo|no quiero vivir)/i.test(text)) {
    return 'EMERGENCY_CONTACT';
  }

  // Panic keywords
  if (/(no puedo respirar|me ahogo|me voy a morir|pecho|corazón late|pánico|ataque)/i.test(text)) {
    return 'PANIC_MODE';
  }

  // Vault keywords  
  if (/(no valgo|nadie me quiere|soy un estorbo|no merezco|soy basura)/i.test(text)) {
    return 'VAULT';
  }

  return null;
}

// ============= ANCLA CHAT SERVICE =============
class AnclaChat {
  private chat: any;
  private model: any;

  constructor() {
    if (!API_KEY) {
      console.error('❌ Gemini API key is missing! Chat will not work.');
    }
    
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: ANCLA_SYSTEM_PROMPT,
    });
    
    this.chat = this.model.startChat({
      history: [],
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1500,
      },
    });
  }

  async sendMessage(userMessage: string): Promise<{
    response: string;
    trigger: ChatMessage['trigger'] | null;
    distortions: CognitiveDistortion[];
  }> {
    try {
      console.log('📤 Enviando mensaje a Gemini:', userMessage);
      
      const trigger = detectTriggers(userMessage);
      const distortions = detectDistortions(userMessage);
      
      console.log('🔍 Trigger detectado:', trigger);
      console.log('🧠 Distorsiones detectadas:', distortions);

      console.log('⏳ Llamando a Gemini API...');
      const result = await this.chat.sendMessage(userMessage);
      console.log('✅ Respuesta recibida de Gemini');
      
      const responseText = result.response.text();
      console.log('📥 Texto de respuesta:', responseText);

      // Check if AI added triggers in response
      let detectedTrigger = trigger;
      if (responseText.includes('[TRIGGER_VAULT]')) {
        detectedTrigger = 'VAULT';
      } else if (responseText.includes('[TRIGGER_PANIC_MODE]')) {
        detectedTrigger = 'PANIC_MODE';
      } else if (responseText.includes('[TRIGGER_EMERGENCY_CONTACT]')) {
        detectedTrigger = 'EMERGENCY_CONTACT';
      }

      // Clean response (remove trigger markers)
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
      console.error('❌ Ancla chat error:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        response: error?.response
      });
      
      let errorMessage = 'Lo siento, el espejo se ha empañado un momento. Respira profundo e intenta de nuevo.';
      
      if (error?.message?.includes('API key')) {
        errorMessage = 'Parece que falta la configuración. Revisa la consola del navegador.';
      } else if (error?.status === 429) {
        errorMessage = 'He recibido muchas solicitudes. Espera un momento e intenta de nuevo.';
      }
      
      return {
        response: errorMessage,
        trigger: null,
        distortions: []
      };
    }
  }

  resetChat() {
    this.chat = this.model.startChat({ history: [] });
  }
}

export const anclaChat = new AnclaChat();

// ============= DAILY CONTENT GENERATOR =============
export async function generateDailyContent(): Promise<DailyContent | null> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const prompt = `Actúa como un curador de arte y filósofo estoico. Genera contenido de bienestar:

1. UNA CITA ESTOICA real y poco conocida (incluye autor).
2. UNA MICRO-ACCIÓN psicológica para mejorar el ánimo (ej. Grounding, 5-4-3-2-1).
3. TRES canciones Indie/Folk/Ambient sobre 'calma interior' (Título - Artista reales).
4. DOS pinturas famosas que evoquen paz o introspección (Título - Artista).
5. UN poema corto (máx 60 palabras) de Benedetti, Neruda, Pizarnik o Sabines sobre esperanza.

RESPONDE SOLO CON ESTE FORMATO JSON (sin markdown, sin bloques de código):
{
  "quote": "texto de la cita",
  "author": "nombre del autor",
  "micro_action": "descripción de la acción",
  "songs": [{"title": "título", "artist": "artista"}],
  "art": [{"title": "título", "artist": "artista"}],
  "poem": {"title": "título", "author": "autor", "text": "texto del poema"}
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      id: '',
      date: new Date().toISOString().split('T')[0],
      quote: parsed.quote || 'La tranquilidad es la buena ordenación de la mente.',
      author: parsed.author || 'Marco Aurelio',
      micro_action: parsed.micro_action || 'Observa 5 cosas azules a tu alrededor.',
      curated_songs: parsed.songs || [],
      curated_art: parsed.art || [],
      poem: parsed.poem || { title: 'Esperanza', author: 'Unknown', text: '...' },
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Daily content generation error:', error);
    return null;
  }
}

// ============= BREATHING GUIDE =============
export async function generateBreathingGuide(): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    });

    const prompt = `Genera una guía breve de respiración 4-4-4-4 (inhala 4, retén 4, exhala 4, retén 4).
Usa lenguaje calmado, presente, en segunda persona.
Máximo 50 palabras.
No uses asteriscos ni formato markdown.
Ejemplo: "Inhala profundamente por la nariz... dos... tres... cuatro. Retén el aire, siente la calma. Exhala lentamente por la boca, liberando tensión. Retén en el vacío, estás a salvo."`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Breathing guide error:', error);
    return 'Inhala profundamente... dos... tres... cuatro. Retén el aire. Exhala suavemente... liberando tensión. Retén. Estás a salvo.';
  }
}

// ============= welcome PHRASE =============
export async function getWelcomePhrase(): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const result = await model.generateContent(
      'Genera UNA frase corta de bienvenida para una app de bienestar emocional. Máximo 10 palabras. Sin comillas. En español.'
    );
    
    return result.response.text().trim();
  } catch (error) {
    console.error('Welcome phrase error:', error);
    return 'Bienvenido a tu espacio de calma.';
  }
}

// ============= POEM GENERATOR FOR SELF-WORTH =============
export async function generateSelfWorthPoem(): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const prompt = `Escribe un poema en prosa muy corto (máx 60 palabras) dirigido a alguien que siente que "no es suficiente". 
Tono cálido, cercano, no condescendiente. 
Sin asteriscos ni formato markdown.
En español.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Poem generation error:', error);
    return 'Eres suficiente tal como eres. No necesitas ser más ni menos. Tu existencia tiene valor por sí misma.';
  }
}
