import type { DailyContent } from '../models';

export interface CuratedEntry {
  quote: string;
  author: string;
  micro_action: string;
  songs: Array<{
    title: string;
    artist: string;
  }>;
  art: Array<{
    title: string;
    artist: string;
    image_url: string;
    year?: string;
    museum?: string;
  }>;
  poem: {
    title: string;
    author: string;
    text: string;
  };
}

export const CURATED_LIBRARY: CuratedEntry[] = [
  {
    quote: "No nos perturban las cosas que pasan, sino el juicio que nos formamos sobre esas cosas.",
    author: "Epicteto",
    micro_action: "Toma una pausa de 2 minutos. Identifica un pensamiento estresante que hayas tenido hoy y escribe: 'Estoy teniendo el pensamiento de que...' para separarte de él (Defusión Cognitiva).",
    songs: [
      { title: "Weightless", artist: "Marconi Union" },
      { title: "Spiegel im Spiegel", artist: "Arvo Pärt" },
      { title: "Daylight", artist: "David O'Dowda" }
    ],
    art: [
      {
        title: "El caminante sobre el mar de nubes",
        artist: "Caspar David Friedrich",
        year: "1818",
        museum: "Kunsthalle Hamburg",
        image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
      },
      {
        title: "Nenúfares en la mañana",
        artist: "Claude Monet",
        year: "1914",
        museum: "Musée de l'Orangerie",
        image_url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80"
      }
    ],
    poem: {
      title: "La casa de huéspedes",
      author: "Rumi",
      text: "El ser humano es una casa de huéspedes. Cada mañana una nueva llegada: una alegría, una tristeza, una maldad... ¡Dales la bienvenida a todos! Trátalos con respeto; puede que estén barriendo tu casa para dejar sitio a un nuevo deleite."
    }
  },
  {
    quote: "La tranquilidad no es más que el buen orden de la mente.",
    author: "Marco Aurelio",
    micro_action: "Técnica 5-4-3-2-1: Nombra en voz baja 5 cosas que ves, 4 que puedes tocar, 3 que escuchas, 2 que puedes oler y 1 respiración profunda que puedes saborear.",
    songs: [
      { title: "Gymnopédie No. 1", artist: "Erik Satie" },
      { title: "Clair de Lune", artist: "Claude Debussy" },
      { title: "Opening", artist: "Philip Glass" }
    ],
    art: [
      {
        title: "Paisaje con lago al atardecer",
        artist: "William Turner",
        year: "1845",
        museum: "Tate Britain",
        image_url: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80"
      },
      {
        title: "Noche estrellada sobre el Ródano",
        artist: "Vincent van Gogh",
        year: "1888",
        museum: "Musée d'Orsay",
        image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
      }
    ],
    poem: {
      title: "Paso a paso",
      author: "Lao Tzu",
      text: "El viaje de mil millas comienza con un solo paso. No temas avanzar despacio; teme únicamente quedarte inmóvil en la duda."
    }
  },
  {
    quote: "Sufrimos más a menudo en la imaginación que en la realidad.",
    author: "Séneca",
    micro_action: "Prueba la regla de las 48 horas: ¿Esto que te preocupa tendrá el mismo peso dentro de 48 horas, 48 días o 48 meses? Ajusta tu energía a la escala real.",
    songs: [
      { title: "An Ending (Ascent)", artist: "Brian Eno" },
      { title: "Treefingers", artist: "Radiohead" },
      { title: "Avril 14th", artist: "Aphex Twin" }
    ],
    art: [
      {
        title: "Niebla matutina en el pinar",
        artist: "Ivan Shishkin",
        year: "1889",
        museum: "Tretyakov Gallery",
        image_url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"
      },
      {
        title: "El puente japonés",
        artist: "Claude Monet",
        year: "1899",
        museum: "National Gallery",
        image_url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80"
      }
    ],
    poem: {
      title: "El claro en el bosque",
      author: "Mary Oliver",
      text: "No tienes que ser bueno. Solo tienes que dejar que el suave animal de tu cuerpo ame lo que ama. El mundo sigue ofreciéndose a tu imaginación."
    }
  },
  {
    quote: "Cuando ya no somos capaces de cambiar una situación, nos encontramos ante el desafío de cambiarnos a nosotros mismos.",
    author: "Viktor Frankl",
    micro_action: "Pon una mano en tu pecho sobre el corazón, cierra los ojos y respira 3 veces sintiendo la calidez de tu tacto. Recuérdate: 'Este momento es difícil, y merezco amabilidad'.",
    songs: [
      { title: "Holocene", artist: "Bon Iver" },
      { title: "Intro", artist: "The xx" },
      { title: "To Build a Home", artist: "The Cinematic Orchestra" }
    ],
    art: [
      {
        title: "Montañas en la calma",
        artist: "Albert Bierstadt",
        year: "1868",
        museum: "Smithsonian",
        image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
      },
      {
        title: "Jardín zen al amanecer",
        artist: "Kawai Gyokudō",
        year: "1930",
        museum: "Tokyo National Museum",
        image_url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
      }
    ],
    poem: {
      title: "Invictus",
      author: "William Ernest Henley",
      text: "En la noche que me cubre, negra como el abismo de polo a polo, agradezco a los dioses que puedan existir por mi alma inconquistable. Soy el amo de mi destino, soy el capitán de mi alma."
    }
  },
  {
    quote: "La vida es muy simple, pero insistimos en hacerla complicada.",
    author: "Confucio",
    micro_action: "Micro-limpieza atenta: Dedica 3 minutos a ordenar únicamente una superficie pequeña (tu mesa o un cajón), haciendo cada movimiento con plena presencia y sin prisa.",
    songs: [
      { title: "Experience", artist: "Ludovico Einaudi" },
      { title: "Comptine d'un autre été", artist: "Yann Tiersen" },
      { title: "River Flows in You", artist: "Yiruma" }
    ],
    art: [
      {
        title: "Mar en calma con reflejo de luna",
        artist: "Peder Balke",
        year: "1860",
        museum: "National Gallery of Norway",
        image_url: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80"
      },
      {
        title: "Cipreses bajo el cielo nocturno",
        artist: "Vincent van Gogh",
        year: "1889",
        museum: "Kröller-Müller Museum",
        image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
      }
    ],
    poem: {
      title: "El río interior",
      author: "Hermann Hesse",
      text: "Aprende del agua: fluye sin esfuerzo, rodea los obstáculos con suavidad y siempre encuentra su camino hacia el océano de la paz."
    }
  },
  {
    quote: "La felicidad de tu vida depende de la calidad de tus pensamientos.",
    author: "Marco Aurelio",
    micro_action: "Escaneo somático exprés: Suelta la mandíbula, baja los hombros alejándolos de las orejas y desaprieta las manos. Respira hondo.",
    songs: [
      { title: "Bloom", artist: "The Paper Kites" },
      { title: "Sunset Lover", artist: "Petit Biscuit" },
      { title: "Re:Stacks", artist: "Bon Iver" }
    ],
    art: [
      {
        title: "Campos de lavanda en Provenza",
        artist: "Paul Cézanne",
        year: "1890",
        museum: "Musée d'Orsay",
        image_url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
      },
      {
        title: "Amanecer sobre el valle",
        artist: "Thomas Cole",
        year: "1836",
        museum: "Metropolitan Museum",
        image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
      }
    ],
    poem: {
      title: "Presente",
      author: "Octavio Paz",
      text: "El agua abre un espacio en el aire. La luz lo llena. El instante no tiene peso, ni antes ni después. Solo este latido quieto."
    }
  },
  {
    quote: "Ningún hombre es libre si no es dueño de sí mismo.",
    author: "Epicteto",
    micro_action: "Crea un ancla de gratitud: Escribe mentalmente o en tu Bitácora tres cosas específicas y ordinarias que salieron bien hoy (un café caliente, un mensaje amable, un respiro).",
    songs: [
      { title: "Nuvole Bianche", artist: "Ludovico Einaudi" },
      { title: "Porz Goret", artist: "Yann Tiersen" },
      { title: "Divenire", artist: "Ludovico Einaudi" }
    ],
    art: [
      {
        title: "Bosque dorado en otoño",
        artist: "Gustav Klimt",
        year: "1902",
        museum: "Belvedere Museum",
        image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80"
      },
      {
        title: "Horizonte azul profundo",
        artist: "Winslow Homer",
        year: "1895",
        museum: "Museum of Fine Arts",
        image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
      }
    ],
    poem: {
      title: "Silencio",
      author: "Antonio Machado",
      text: "Caminante, son tus huellas el camino y nada más; caminante, no hay camino, se hace camino al andar. Al andar se hace el camino, y al volver la vista atrás se ve la senda que nunca se ha de volver a pisar."
    }
  }
];

export function getSpotifyUrl(title: string, artist?: string): string {
  const query = encodeURIComponent(`${title} ${artist || ''}`.trim());
  return `https://open.spotify.com/search/${query}`;
}

export function getYouTubeMusicUrl(title: string, artist?: string): string {
  const query = encodeURIComponent(`${title} ${artist || ''}`.trim());
  return `https://music.youtube.com/search?q=${query}`;
}

export function getCuratedDailyContent(dateStr?: string): DailyContent {
  const today = dateStr || new Date().toISOString().split('T')[0];
  
  // Deterministic numeric hash from date string (YYYY-MM-DD)
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash << 5) - hash + today.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CURATED_LIBRARY.length;
  const item = CURATED_LIBRARY[index];

  return {
    id: `curated-${today}`,
    date: today,
    quote: item.quote,
    author: item.author,
    micro_action: item.micro_action,
    curated_songs: item.songs.map(s => ({
      title: s.title,
      artist: s.artist,
      url: getSpotifyUrl(s.title, s.artist)
    })),
    curated_art: item.art.map(a => ({
      title: a.title,
      artist: `${a.artist}${a.year ? ` (${a.year})` : ''}`,
      image_url: a.image_url
    })),
    poem: item.poem,
    created_at: new Date().toISOString()
  };
}
