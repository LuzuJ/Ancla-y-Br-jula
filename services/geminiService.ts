import { GoogleGenAI, Modality } from "@google/genai";
import { DailyContent } from "../types";

// Helper to decode audio
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- FEATURE: Fast AI Response (Welcome Message) ---
export const getWelcomePhrase = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Corrected from lite-latest to standard flash for stability
      contents: "Generate a single, short, inspiring phrase (max 10 words) in Spanish about finding calm in chaos. No quotes, just the text.",
    });
    return response.text || "Bienvenido a tu refugio.";
  } catch (error) {
    console.error("Welcome phrase error:", error);
    return "Respira profundo. Estás aquí.";
  }
};

// --- FEATURE: Generate Speech (TTS) ---
export const generateBreathingAudio = async (text: string): Promise<AudioBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep, calming voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1
    );
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const generatePoemAndAudio = async (): Promise<{text: string, audio: AudioBuffer | null}> => {
  // 1. Generate Text First
  const textResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: "Escribe un poema en prosa muy corto (max 60 palabras) dirigido a alguien que siente que 'no es suficiente'. Tono cálido, cercano, no condescendiente. En Español.",
  });
  
  const text = textResponse.text || "Eres suficiente tal como eres.";

  // 2. Convert to Audio
  const audioBuffer = await generateBreathingAudio(text);

  return { text, audio: audioBuffer };
};


// --- FEATURE: AI Powered Chatbot (Compassionate Mirror) ---
export const createChatSession = () => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview', // High quality model for emotional intelligence
    config: {
      systemInstruction: `Actúa como un 'Espejo Compasivo'. 
      Regla de Oro: NUNCA des la solución directa ni digas 'tienes que hacer esto'. 
      Tu misión es validar la emoción y devolver la pregunta para que el usuario encuentre su propia respuesta.
      Estilo: Positivo, empático, breve, en Español.
      Ejemplo: Usuario: 'Estoy triste'. IA: 'Entiendo que sientas pesadez hoy. A veces la tristeza viene a mostrarnos algo importante. ¿Qué crees que te está pidiendo tu cuerpo?'`,
    },
  });
};

// --- FEATURE: Google Search Grounding (Curator & Quotes) ---
export const getDailyContent = async (): Promise<DailyContent | null> => {
  try {
    const prompt = `
      Actúa como un curador de arte y filósofo estoico. Busca en internet información REAL y devuélveme lo siguiente:
      1. Una cita estoica REAL y poco conocida (incluye autor).
      2. Una micro-acción psicológica validada para mejorar el ánimo (ej. Grounding).
      3. 3 canciones Indie/Folk recientes sobre 'calma en el caos' (Titulo - Artista).
      4. 2 pinturas famosas que evoquen soledad pacífica.
      5. 1 poema corto de autor latinoamericano sobre esperanza.

      IMPORTANTE: Usa la herramienta de búsqueda de Google para verificar que las citas y obras existan.
      Devuelve la respuesta en texto plano pero estructurado claramente para que pueda leerlo, NO uses bloques de código JSON, solo texto separado por etiquetas como [CITA], [ACCION], [CANCIONES], [PINTURAS], [POEMA].
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    
    // Very basic parsing logic (robustness would require JSON mode but Search doesn't support JSON mode yet)
    // This is a simplified parser for the demo
    const sections = text.split('[');
    const content: any = {};
    
    sections.forEach(s => {
      if(s.startsWith('CITA]')) content.quote = s.replace('CITA]', '').trim();
      if(s.startsWith('ACCION]')) content.action = s.replace('ACCION]', '').trim();
      if(s.startsWith('CANCIONES]')) content.songs = s.replace('CANCIONES]', '').trim().split('\n').filter(l => l.length > 5).map(l => ({title: l, artist: ''}));
      if(s.startsWith('PINTURAS]')) content.art = s.replace('PINTURAS]', '').trim().split('\n').filter(l => l.length > 5).map(l => ({title: l, artist: ''}));
      if(s.startsWith('POEMA]')) content.poem = s.replace('POEMA]', '').trim();
    });

    return {
      quote: content.quote || "La tranquilidad es la buena ordenación de la mente. - Marco Aurelio",
      author: "Marco Aurelio",
      action: content.action || "Tómate 2 minutos para observar 5 cosas de color azul a tu alrededor.",
      curatedContent: {
        songs: content.songs || [],
        art: content.art || [],
        poem: { title: "Esperanza", author: "Unknown", text: content.poem || "..." }
      }
    };

  } catch (error) {
    console.error("Content generation error:", error);
    return null;
  }
};
