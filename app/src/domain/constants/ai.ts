export type AIProvider = 'deepseek' | 'gemini' | 'openai' | 'groq' | 'ollama' | 'custom';

export interface SuggestedModel {
  id: string;
  name: string;
}

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  tagline: string;
  defaultBaseUrl: string;
  defaultModel: string;
  suggestedModels: SuggestedModel[];
  keyPlaceholder: string;
  keyHelpUrl: string;
  requiresKey: boolean;
  isLocal?: boolean;
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    tagline: 'Excelente para diálogo socrático y TCC, alta empatía y bajo costo.',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    suggestedModels: [
      { id: 'deepseek-chat', name: 'DeepSeek-V3 (Recomendado · Rápido y empático)' },
      { id: 'deepseek-reasoner', name: 'DeepSeek-R1 (Razonamiento profundo)' }
    ],
    keyPlaceholder: 'sk-...',
    keyHelpUrl: 'https://platform.deepseek.com/api_keys',
    requiresKey: true
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    tagline: 'Infraestructura de Google con SDK nativo y cuota gratuita.',
    defaultBaseUrl: '',
    defaultModel: 'gemini-2.0-flash',
    suggestedModels: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Última generación · Ultra veloz)' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Ligero y balanceado)' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Máxima capacidad)' }
    ],
    keyPlaceholder: 'AIzaSy...',
    keyHelpUrl: 'https://aistudio.google.com/app/apikey',
    requiresKey: true
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    tagline: 'Modelos GPT de última generación con alto seguimiento de instrucciones.',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    suggestedModels: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Rápido, económico y preciso)' },
      { id: 'gpt-4o', name: 'GPT-4o (Modelo insignia multimodal)' }
    ],
    keyPlaceholder: 'sk-proj-...',
    keyHelpUrl: 'https://platform.openai.com/api-keys',
    requiresKey: true
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    tagline: 'Inferencia ultra rápida por hardware LPU (mínima latencia).',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    suggestedModels: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Ultra rápido)' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (32k contexto)' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B' }
    ],
    keyPlaceholder: 'gsk_...',
    keyHelpUrl: 'https://console.groq.com/keys',
    requiresKey: true
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local / Offline)',
    tagline: '100% privado en tu computadora sin enviar datos a internet.',
    defaultBaseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3.2',
    suggestedModels: [
      { id: 'llama3.2', name: 'Llama 3.2 (Meta)' },
      { id: 'mistral', name: 'Mistral 7B' },
      { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B' },
      { id: 'gemma2:9b', name: 'Gemma 2 9B' }
    ],
    keyPlaceholder: 'No requerida (Servidor Local)',
    keyHelpUrl: 'https://ollama.com/',
    requiresKey: false,
    isLocal: true
  },
  custom: {
    id: 'custom',
    name: 'Personalizado (OpenAI Compatible)',
    tagline: 'Conecta cualquier endpoint compatible (OpenRouter, LM Studio, vLLM, etc.)',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: '',
    suggestedModels: [],
    keyPlaceholder: 'API Key o Token de acceso...',
    keyHelpUrl: '',
    requiresKey: false
  }
};
