interface JikanAnime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
}

interface YouTubeSearchItem {
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
  };
  id: {
    videoId: string;
  };
}

// Cache para resultados de búsqueda
const searchCache = new Map<string, string>();
const videoCache = new Map<string, { title: string; url: string }>();

// Sistema de rate limiting simple
let lastApiCall = 0;
const MIN_API_DELAY = 500; // Reducido a 500ms

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handleRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  if (timeSinceLastCall < MIN_API_DELAY) {
    await wait(MIN_API_DELAY - timeSinceLastCall);
  }
  
  lastApiCall = Date.now();
};

export async function getAnimeImage(animeName: string): Promise<string | null> {
  if (!animeName) {
    console.error('Nombre del anime no proporcionado');
    return null;
  }

  // Verificar cache primero
  const cacheKey = animeName.toLowerCase().trim();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey) || null;
  }

  try {
    await handleRateLimit();
    
    console.log('Buscando imagen para:', animeName);
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&limit=1`);
    
    if (response.status === 429) {
      console.log('Rate limit alcanzado, esperando...');
      await wait(1000);
      return getAnimeImage(animeName);
    }

    if (!response.ok) {
      throw new Error(`Error en la respuesta de la API: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].images.jpg.image_url;
      console.log('Imagen encontrada:', imageUrl);
      searchCache.set(cacheKey, imageUrl);
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error al buscar imagen:', error);
    return null;
  }
}

async function checkVideoAvailability(videoId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function getAnimeOpening(animeName: string): Promise<{ title: string; url: string } | null> {
  if (!animeName) {
    console.error('Nombre del anime no proporcionado');
    return null;
  }

  // Verificar cache primero
  const cacheKey = animeName.toLowerCase().trim();
  if (videoCache.has(cacheKey)) {
    return videoCache.get(cacheKey) || null;
  }

  const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  
  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key no encontrada');
    return null;
  }

  try {
    // Reducir el número de búsquedas iniciales
    const searchQueries = [
      `${animeName} opening 1 full`,
      `${animeName} op 1 HD`,
      `${animeName} opening theme`
    ];

    for (const searchQuery of searchQueries) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        new URLSearchParams({
          part: 'snippet',
          q: searchQuery,
          key: YOUTUBE_API_KEY,
          type: 'video',
          maxResults: '5', // Reducido a 5 resultados
          videoCategoryId: '10',
          videoEmbeddable: 'true'
        })
      );

      if (!response.ok) {
        if (response.status === 403) break;
        continue;
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        for (const video of data.items) {
          const videoId = video.id.videoId;
          
          const isAvailable = await checkVideoAvailability(videoId);
          
          if (isAvailable) {
            const result = {
              title: video.snippet.title,
              url: `https://www.youtube.com/watch?v=${videoId}`
            };
            
            videoCache.set(cacheKey, result);
            return result;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error al buscar video:', error);
    return null;
  }
} 