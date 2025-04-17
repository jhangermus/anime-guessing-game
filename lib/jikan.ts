interface JikanAnime {
  mal_id: number;
  title: string;
  titles: Array<{ type: string; title: string }>;
  images: {
    jpg: {
      image_url: string;
    };
  };
}

interface JikanVideo {
  title: string;
  video?: {
    url: string;
  };
  trailer?: {
    url: string;
  };
}

async function checkVideoAvailability(videoId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`);
    return response.ok;
  } catch {
    return false;
  }
}

async function searchYouTubeVideo(query: string): Promise<{ title: string; url: string } | null> {
  const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  
  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key no encontrada. Asegúrate de que NEXT_PUBLIC_YOUTUBE_API_KEY está configurada en .env.local');
    return null;
  }

  // Diferentes variaciones de búsqueda para aumentar las posibilidades de éxito
  const searchVariations = [
    `${query} opening 1 full`,
    `${query} opening 1 oficial`,
    `${query} first opening HD`,
    `${query} opening original`,
    `${query} op 1 full`,
    `${query} opening`
  ];

  for (const searchQuery of searchVariations) {
    try {
      console.log('Intentando búsqueda en YouTube:', searchQuery);
      
      // Usar la API de YouTube directamente con la key pública
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        new URLSearchParams({
          part: 'snippet',
          q: searchQuery,
          key: YOUTUBE_API_KEY,
          type: 'video',
          maxResults: '5',
          videoCategoryId: '10',
          videoEmbeddable: 'true'
        })
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta de YouTube:', errorData);
        throw new Error(`Error en la búsqueda de YouTube: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Encontrados ${data.items?.length || 0} resultados para "${searchQuery}"`);
      
      if (data.items && data.items.length > 0) {
        // Intentar cada video hasta encontrar uno disponible
        for (const video of data.items) {
          const videoId = video.id.videoId;
          console.log('Verificando disponibilidad del video:', video.snippet.title);
          
          // Crear un iframe temporal para verificar si el video se puede reproducir
          const testUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
          const canEmbed = await new Promise<boolean>(resolve => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = testUrl;
            
            const timeout = setTimeout(() => {
              document.body.removeChild(iframe);
              resolve(false);
            }, 3000);

            iframe.onload = () => {
              clearTimeout(timeout);
              document.body.removeChild(iframe);
              resolve(true);
            };

            document.body.appendChild(iframe);
          });

          if (canEmbed) {
            console.log('Video disponible encontrado:', video.snippet.title);
            return {
              title: video.snippet.title,
              url: `https://www.youtube.com/watch?v=${videoId}`
            };
          } else {
            console.log('Video no disponible o bloqueado, intentando siguiente...');
          }
        }
      }
    } catch (error) {
      console.error('Error en variación de búsqueda:', searchQuery, error);
      continue; // Continuar con la siguiente variación
    }
  }
  
  console.log('No se encontraron videos disponibles después de intentar todas las variaciones');
  return null;
}

// Cache para videos de Naruto (hardcoded para pruebas)
const NARUTO_OPENINGS = [
  {
    title: "Naruto Opening 1 - ROCKS",
    url: "https://www.youtube.com/watch?v=4t__wczfpRI"
  },
  {
    title: "Naruto Opening 2 - Haruka Kanata",
    url: "https://www.youtube.com/watch?v=SRn99oN1p_c"
  },
  {
    title: "Naruto Opening 3 - Blue Bird",
    url: "https://www.youtube.com/watch?v=aJRu5ltxXjc"
  }
];

// Función para esperar entre llamadas a la API
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Sistema de rate limiting simple
let lastApiCall = 0;
const MIN_API_DELAY = 2000; // 2 segundos entre llamadas

const handleRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  if (timeSinceLastCall < MIN_API_DELAY) {
    await wait(MIN_API_DELAY - timeSinceLastCall);
  }
  
  lastApiCall = Date.now();
};

// Sistema de cola para peticiones a Jikan
class JikanQueue {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private lastCallTime = 0;
  private readonly MIN_DELAY = 4000; // 4 segundos entre llamadas

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTime;
      
      if (timeSinceLastCall < this.MIN_DELAY) {
        await new Promise(resolve => setTimeout(resolve, this.MIN_DELAY - timeSinceLastCall));
      }

      const request = this.queue.shift();
      if (request) {
        this.lastCallTime = Date.now();
        try {
          await request();
        } catch (error) {
          console.error('Error procesando petición:', error);
        }
      }
    }
    this.isProcessing = false;
  }
}

const jikanQueue = new JikanQueue();

// Cache para resultados de búsqueda
const searchCache = new Map<string, any>();

export async function searchAnime(query: string) {
  // Verificar cache primero
  const cacheKey = query.toLowerCase().trim();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const makeRequest = async () => {
    try {
      const normalizedQuery = query
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .trim();

      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(normalizedQuery)}&limit=5`);
      
      if (response.status === 429) {
        throw new Error('Rate limit alcanzado');
      }

      if (!response.ok) {
        throw new Error(`Error en la respuesta de la API: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const bestMatch = data.data[0];
        const result = {
          imageUrl: bestMatch.images.jpg.image_url,
          title: bestMatch.title,
          malId: bestMatch.mal_id
        };
        
        // Guardar en cache
        searchCache.set(cacheKey, result);
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Error en searchAnime:', error);
      return null;
    }
  };

  return jikanQueue.add(makeRequest);
}

export async function getAnimeVideos(malId: number) {
  try {
    // Para Naruto, usar directamente los openings conocidos
    if (malId === 20) {
      console.log('Usando opening precargado de Naruto');
      return NARUTO_OPENINGS[0];
    }

    // Para otros animes, intentar primero YouTube directamente
    const animeTitle = await (async () => {
      try {
        await handleRateLimit();
        const response = await fetch(`https://api.jikan.moe/v4/anime/${malId}`);
        if (response.ok) {
          const data = await response.json();
          return data.data?.title;
        }
      } catch (error) {
        console.error('Error obteniendo título del anime:', error);
      }
      return null;
    })();

    if (animeTitle) {
      const youtubeResult = await searchYouTubeVideo(`${animeTitle} opening 1`);
      if (youtubeResult) {
        return youtubeResult;
      }
    }

    // Si no se encuentra por título, intentar con videos
    await handleRateLimit();
    const response = await fetch(`https://api.jikan.moe/v4/anime/${malId}/videos`);
    
    if (!response.ok) {
      if (response.status === 429) {
        console.log('Rate limit alcanzado, usando búsqueda alternativa...');
        return searchYouTubeVideo(`anime ${malId} opening`);
      }
      throw new Error(`Error en la respuesta de la API: ${response.status}`);
    }

    const data = await response.json();
    
    // Usar el primer video musical disponible
    if (data.data?.music_videos?.length > 0) {
      const video = data.data.music_videos[0];
      if (video.video?.url?.includes('youtube.com')) {
        return {
          title: video.title,
          url: video.video.url
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error en getAnimeVideos:', error);
    return null;
  }
} 