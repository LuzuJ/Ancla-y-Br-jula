import type { CognitiveDistortion } from '../models';

export interface DistortionInfo {
  name: string;
  emoji: string;
  description: string;
  socraticQuestions: string[];
  reframeTemplate: string;
}

export const DISTORTION_GUIDE: Record<CognitiveDistortion, DistortionInfo> = {
  generalization: {
    name: 'Generalización Excesiva',
    emoji: '⚡',
    description: 'Concluir que porque algo salió mal una vez, siempre saldrá mal o aplica a toda tu vida ("siempre", "nunca", "todos").',
    socraticQuestions: [
      '¿Existe alguna excepción a esta regla donde las cosas no salieron así?',
      '¿Estoy tomando un hecho aislado y convirtiéndolo en una ley universal?',
      '¿Qué le diría a un amigo que usa las palabras "siempre" o "nunca" en esta situación?'
    ],
    reframeTemplate: 'Aunque hoy fue difícil, esto es un momento específico y no define todo mi camino.'
  },
  'all-or-nothing': {
    name: 'Pensamiento Todo o Nada',
    emoji: '🌓',
    description: 'Ver las cosas en categorías absolutas blanco o negro, sin reconocer los matices grises o el progreso intermedio.',
    socraticQuestions: [
      '¿Es posible que esto no sea un éxito total ni un fracaso total, sino algo en el medio?',
      '¿Qué porcentaje de lo que hice sí tuvo valor o aprendizaje?',
      '¿El progreso imperfecto sigue siendo progreso?'
    ],
    reframeTemplate: 'No necesito ser perfecto para tener valor. El progreso gradual es suficiente.'
  },
  catastrophizing: {
    name: 'Pensamiento Catastrófico',
    emoji: '🌪️',
    description: 'Imaginar automáticamente el peor escenario posible y asumir que ocurrirá y que no podrás soportarlo.',
    socraticQuestions: [
      '¿Qué es lo peor que realmente podría pasar y qué recursos tengo para afrontarlo si ocurre?',
      '¿Cuál es el escenario más probable y realista (no el más catastrófico)?',
      '¿He superado momentos difíciles en el pasado?'
    ],
    reframeTemplate: 'Mi mente está imaginando el peor caso. El escenario más probable es manejable y sé afrontar dificultades.'
  },
  'self-deprecation': {
    name: 'Devaluación Propia',
    emoji: '💔',
    description: 'Tratarte con dureza y atribuir los errores a un defecto esencial en tu valor como persona ("no valgo", "soy un fracaso").',
    socraticQuestions: [
      '¿Confundir una acción fallida con mi valor como ser humano es justo?',
      '¿Le hablaría con esta misma crueldad a una persona que quiero?',
      '¿Qué evidencias en mi vida demuestran que tengo cualidades valiosas?'
    ],
    reframeTemplate: 'He cometido un error, pero un error es un evento, no mi identidad. Merezco compasión.'
  },
  'fortune-telling': {
    name: 'Adivinación del Futuro',
    emoji: '🔮',
    description: 'Predecir con certeza que las cosas saldrán mal sin tener evidencia factual suficiente.',
    socraticQuestions: [
      '¿Tengo una bola de cristal real o estoy asumiendo mis miedos como certezas?',
      '¿Qué evidencia objetiva tengo de que esto fallará?',
      '¿Qué pasaría si me concentro en lo que sí puedo controlar ahora mismo?'
    ],
    reframeTemplate: 'No puedo predecir el futuro. Me enfoco en dar mi mejor paso en el presente.'
  },
  'mind-reading': {
    name: 'Lectura de Mente',
    emoji: '👤',
    description: 'Asumir que sabes lo que los demás piensan de ti (generalmente de forma negativa) sin que te lo hayan dicho.',
    socraticQuestions: [
      '¿Tengo pruebas comprobables de lo que la otra persona está pensando?',
      '¿Podría haber otras explicaciones para su comportamiento (estrés, cansancio)?',
      '¿Preguntar directamente aclararía mis dudas en lugar de suponer?'
    ],
    reframeTemplate: 'No puedo leer la mente de los demás. Lo que piensen es su responsabilidad, no mi verdad.'
  }
};
