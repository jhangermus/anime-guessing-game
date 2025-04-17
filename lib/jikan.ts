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

// Sistema de rate limiting simple
let lastApiCall = 0;
const MIN_API_DELAY = 2000; // 2 segundos entre llamadas

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handleRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  if (timeSinceLastCall < MIN_API_DELAY) {
    await wait(MIN_API_DELAY - timeSinceLastCall);
  }
  
  lastApiCall = Date.now();
};

// Cache para resultados de búsqueda
const searchCache = new Map<string, string>();

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
      await wait(2000);
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
    
    console.log('No se encontró imagen');
    return null;
  } catch (error) {
    console.error('Error al buscar imagen:', error);
    return null;
  }
}

// Cache para videos
const videoCache = new Map<string, { title: string; url: string }>();

async function checkVideoAvailability(videoId: string): Promise<boolean> {
  try {
    console.log('Verificando disponibilidad del video ID:', videoId);
    const response = await fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`);
    const isAvailable = response.ok;
    console.log('Respuesta de disponibilidad:', isAvailable ? 'Disponible' : 'No disponible');
    return isAvailable;
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    return false;
  }
}

export async function getAnimeOpening(animeName: string): Promise<{ title: string; url: string } | null> {
  if (!animeName) {
    console.error('Nombre del anime no proporcionado');
    return null;
  }

  const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  console.log('Verificando API key:', YOUTUBE_API_KEY ? 'Presente' : 'No encontrada');
  
  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key no encontrada');
    return null;
  }

  try {
    // Búsquedas genéricas que funcionan para cualquier anime
    const searchQueries = [
      `${animeName} opening 1 full song`,
      `${animeName} op 1 full`,
      `${animeName} first opening HD`,
      `${animeName} opening 1 lyrics`,
      `${animeName} op 1 english sub`,
      `${animeName} opening theme song`,
      `${animeName} op 1 amv hd`,
      `${animeName} opening 1 creditless`
    ];

    for (const searchQuery of searchQueries) {
      console.log('\nIntentando búsqueda con:', searchQuery);
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        new URLSearchParams({
          part: 'snippet',
          q: searchQuery,
          key: YOUTUBE_API_KEY,
          type: 'video',
          maxResults: '15',
          videoCategoryId: '10',
          videoEmbeddable: 'true',
          regionCode: 'US',
          videoSyndicated: 'true'
        })
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta de YouTube:', errorData);
        if (response.status === 403) {
          console.error('Error de autenticación con la API de YouTube. Verifica la API key.');
          break;
        }
        continue;
      }

      const data = await response.json();
      console.log(`Resultados encontrados para "${searchQuery}":`, data.items?.length || 0);
      
      if (data.items && data.items.length > 0) {
        // Ordenar los resultados priorizando videos que probablemente no estén bloqueados
        const sortedVideos = data.items.sort((a: YouTubeSearchItem, b: YouTubeSearchItem) => {
          const aTitle = a.snippet.title.toLowerCase();
          const bTitle = b.snippet.title.toLowerCase();
          
          // Sistema de puntuación genérico para cualquier anime
          const aScore = (
            (aTitle.includes('full') ? 2 : 0) +
            (aTitle.includes('hd') ? 2 : 0) +
            (aTitle.includes('lyrics') ? 1 : 0) +
            (aTitle.includes('sub') ? 1 : 0) +
            (aTitle.includes('english') ? 1 : 0) +
            (aTitle.includes('creditless') ? 2 : 0) +
            (aTitle.includes('amv') ? 1 : 0)
          );
          const bScore = (
            (bTitle.includes('full') ? 2 : 0) +
            (bTitle.includes('hd') ? 2 : 0) +
            (bTitle.includes('lyrics') ? 1 : 0) +
            (bTitle.includes('sub') ? 1 : 0) +
            (bTitle.includes('english') ? 1 : 0) +
            (bTitle.includes('creditless') ? 2 : 0) +
            (bTitle.includes('amv') ? 1 : 0)
          );
          
          return bScore - aScore;
        });

        for (const video of sortedVideos) {
          const videoId = video.id.videoId;
          
          console.log('\nVerificando video:', {
            title: video.snippet.title,
            id: videoId,
            channel: video.snippet.channelTitle,
            publishedAt: video.snippet.publishedAt
          });
          
          try {
            const isAvailable = await checkVideoAvailability(videoId);
            
            if (isAvailable) {
              const result = {
                title: video.snippet.title,
                url: `https://www.youtube.com/watch?v=${videoId}`
              };
              
              console.log('¡Video disponible encontrado!', result);
              return result;
            }
          } catch (error) {
            console.log('Error al verificar video, continuando con el siguiente...');
            continue;
          }
        }
      }
    }
    
    console.log('No se encontró ningún video disponible después de intentar todas las búsquedas');
    return null;
  } catch (error) {
    console.error('Error al buscar video:', error);
    return null;
  }
} 