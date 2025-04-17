"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart3, Flame, HelpCircle, ClipboardList, Send, X, ArrowUp, ArrowDown } from "lucide-react"
import Image from "next/image"
import CharacterAttributesTable from "./character-attributes-table"
import HintButtons from "./hint-buttons"
import SuccessCard from "./success-card"
import { searchAnime, getAnimeVideos } from "@/lib/jikan"
import { YouTubePlayer } from "./youtube-player"
import { Card } from "@/components/ui/card"
import YouTube from 'react-youtube'
import { AnimeData } from '@/types/anime'

// Tipo para la estructura de datos del anime
type AnimeData = {
  nombre: string
  genero: string[]
  demografia: string
  estudio: string
  año_debut: string
  año_finalizacion: string
  capitulos: number
  autor: string
  imagen?: string
}

type AnimeSuggestion = {
  nombre: string
  imagen: string
}

type AnimeJSON = {
  nombre: string
  genero: string[]
  demografia: string
  estudio: string
  año_debut: string
  año_finalizacion: string
  capitulos: number
  autor: string
  imagen: string
}

// Función para convertir de JSON a AnimeData
const convertJSONToAnimeData = (json: AnimeJSON): AnimeData => {
  return {
    nombre: json.nombre,
    genero: json.genero,
    demografia: json.demografia,
    estudio: json.estudio,
    año_debut: json.año_debut,
    año_finalizacion: json.año_finalizacion,
    capitulos: json.capitulos,
    autor: json.autor,
    imagen: json.imagen,
  }
}

// Add this type at the top with other types
type AnimeImageCache = {
  [key: string]: string;
}

// Mover fuera del componente para evitar recreaciones
const youtubeOpts = {
  height: '390',
  width: '640',
  playerVars: {
    autoplay: 1,
  },
} as const;

// Función para filtrar y limitar sugerencias
const filterAndLimitSuggestions = (
  allAnimes: AnimeData[],
  searchValue: string,
  guessHistory: AnimeData[],
  limit = 10
): AnimeData[] => {
  const normalizedValue = searchValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Filtrar animes ya adivinados
  const availableAnimes = allAnimes.filter(anime => 
    !guessHistory.some(guessed => guessed.nombre === anime.nombre)
  );

  // Separar y ordenar resultados
  const startsWithValue = [];
  const containsValue = [];

  for (const anime of availableAnimes) {
    const normalizedName = anime.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalizedName.startsWith(normalizedValue)) {
      startsWithValue.push(anime);
      if (startsWithValue.length === limit) break;
    } else if (normalizedName.includes(normalizedValue)) {
      containsValue.push(anime);
      if (startsWithValue.length + containsValue.length === limit) break;
    }
  }

  return [...startsWithValue, ...containsValue].slice(0, limit);
};

export default function AnimeGuessingGame() {
  const [todaysAnime, setTodaysAnime] = useState<AnimeData | null>(null)
  const [guessInput, setGuessInput] = useState("")
  const [guessHistory, setGuessHistory] = useState<AnimeData[]>([])
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing")
  const [guessCount, setGuessCount] = useState(0)
  const [successCount, setSuccessCount] = useState(0)
  const [playerRank, setPlayerRank] = useState(0)
  const [yesterdaysAnime, setYesterdaysAnime] = useState<AnimeData | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [suggestions, setSuggestions] = useState<AnimeData[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [nextAnimeTime, setNextAnimeTime] = useState({ hours: 12, minutes: 1, seconds: 18 })
  const [timeZone, setTimeZone] = useState(":D")
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showFirstAppearanceHint, setShowFirstAppearanceHint] = useState(false)
  const [showDevilFruitHint, setShowDevilFruitHint] = useState(false)
  const [genreAttempts, setGenreAttempts] = useState(2)
  const [episodeCountAttempts, setEpisodeCountAttempts] = useState(3)
  const [showGenreHint, setShowGenreHint] = useState(false)
  const [showEpisodeCountHint, setShowEpisodeCountHint] = useState(false)
  const [imageCache, setImageCache] = useState<AnimeImageCache>({});
  const [loadingImages, setLoadingImages] = useState<{[key: string]: boolean}>({});
  const [openingAttempts, setOpeningAttempts] = useState(5);
  const [showOpeningHint, setShowOpeningHint] = useState(false);
  const [openingVideo, setOpeningVideo] = useState<{ title: string; url: string } | null>(null);
  const [isLoadingOpening, setIsLoadingOpening] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const maxAttempts = 3;
  const [isBlurDisabled, setIsBlurDisabled] = useState(false);

  // Initialize the game with today's anime and yesterday's anime
  const fetchAnimeOfDay = useCallback(async () => {
    try {
      const response = await fetch('/api/daily');
      const data = await response.json();
      setTodaysAnime(convertJSONToAnimeData(data));
    } catch (error) {
      console.error('Error fetching anime of the day:', error);
    }
  }, []);

  const fetchYesterdaysAnime = useCallback(async () => {
    try {
      const response = await fetch('/api/yesterday');
      const data = await response.json();
      setYesterdaysAnime(convertJSONToAnimeData(data));
    } catch (error) {
      console.error('Error fetching yesterday\'s anime:', error);
    }
  }, []);

  useEffect(() => {
    fetchAnimeOfDay();
    fetchYesterdaysAnime();
  }, [fetchAnimeOfDay, fetchYesterdaysAnime]);

  // Fetch initial success count and set up polling
  useEffect(() => {
    const fetchSuccessCount = async () => {
      try {
        const response = await fetch('/api/contador')
        const data = await response.json()
        setSuccessCount(data.count)
      } catch (error) {
        console.error('Error fetching success count:', error)
      }
    }

    // Fetch initial count
    fetchSuccessCount()

    // Set up polling every 10 seconds
    const interval = setInterval(fetchSuccessCount, 10000)

    return () => clearInterval(interval)
  }, [])

  // Update success count when game is won
  useEffect(() => {
    const updateSuccessCount = async () => {
      if (gameState === "won") {
        try {
          await fetch('/api/contador', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isCorrect: true }),
          })
        } catch (error) {
          console.error('Error updating success count:', error)
        }
      }
    }

    updateSuccessCount()
  }, [gameState])

  // Memoizar el manejador de cambio de input
  const handleInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGuessInput(value);

    if (value.length > 0) {
      try {
        const listaResponse = await fetch('/api/lista');
        const allAnimes: AnimeData[] = await listaResponse.json();
        
        const filteredSuggestions = filterAndLimitSuggestions(allAnimes, value, guessHistory);
        setSuggestions(filteredSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [guessHistory]);

  // Memoizar el manejador de clic en sugerencia
  const handleSuggestionClick = useCallback((anime: AnimeData) => {
    setGuessInput(anime.nombre);
    setShowSuggestions(false);
    submitGuess(anime);
  }, []);

  // Memoizar la función de envío
  const submitGuess = useCallback(async (anime: AnimeData) => {
    if (gameState !== "playing") return;

    setGuessHistory(prev => [anime, ...prev]);
    setGuessCount(prev => prev + 1);

    if (anime.nombre === todaysAnime?.nombre) {
      setGameState("won");
    } else {
      // Actualizar intentos para las pistas de manera más eficiente
      setOpeningAttempts(prev => {
        const newAttempts = Math.max(0, prev - 1);
        if (newAttempts === 0) {
          setShowOpeningHint(true);
        }
        return newAttempts;
      });

      setGenreAttempts(prev => {
        const newAttempts = Math.max(0, prev - 1);
        if (newAttempts === 0) {
          setShowGenreHint(true);
        }
        return newAttempts;
      });

      setEpisodeCountAttempts(prev => {
        const newAttempts = Math.max(0, prev - 1);
        if (newAttempts === 0) {
          setShowEpisodeCountHint(true);
        }
        return newAttempts;
      });
    }
    
    setGuessInput("");
    setSuggestions([]);
    setShowSuggestions(false);

    // Mantener el foco en el input
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [gameState, todaysAnime]);

  // Efecto para cargar el opening
  useEffect(() => {
    if (showOpeningHint && !openingVideo && !isLoadingOpening && todaysAnime) {
      const loadOpening = async () => {
        setIsLoadingOpening(true);
        try {
          const video = await getAnimeVideos(todaysAnime.malId);
          if (video) {
            setOpeningVideo(video);
          }
        } catch (error) {
          console.error('Error al cargar el opening:', error);
        } finally {
          setIsLoadingOpening(false);
        }
      };
      
      loadOpening();
    }
  }, [showOpeningHint, openingVideo, isLoadingOpening, todaysAnime]);

  // Extraer videoId del URL de YouTube
  const videoId = useMemo(() => {
    if (!openingVideo?.url) return null;
    const match = openingVideo.url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  }, [openingVideo?.url]);

  // Countdown timer for next anime
  useEffect(() => {
    if (gameState !== "won") return

    const timer = setInterval(() => {
      setNextAnimeTime((prev) => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1
        if (totalSeconds <= 0) {
          clearInterval(timer)
          return { hours: 0, minutes: 0, seconds: 0 }
        }

        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Add this function after other functions
  const fetchAnimeImage = async (animeName: string) => {
    if (imageCache[animeName] || loadingImages[animeName]) return;
    
    setLoadingImages(prev => ({ ...prev, [animeName]: true }));
    
    try {
      const animeData = await searchAnime(animeName);
      if (animeData) {
        setImageCache(prev => ({
          ...prev,
          [animeName]: animeData.imageUrl
        }));
      }
    } catch (error) {
      console.error(`Error fetching image for ${animeName}:`, error);
    } finally {
      setLoadingImages(prev => ({ ...prev, [animeName]: false }));
    }
  };

  // Función para obtener el opening
  const fetchOpening = async () => {
    if (!todaysAnime || isLoadingOpening) {
      console.log('No se puede obtener el opening:', { todaysAnime, isLoadingOpening });
      return;
    }
    
    console.log('Intentando obtener el opening para:', todaysAnime.nombre);
    setIsLoadingOpening(true);
    
    try {
      const videoData = await getAnimeVideos(20); // ID de Naruto hardcodeado temporalmente
      console.log('Videos encontrados:', videoData);
      
      if (videoData) {
        setOpeningVideo(videoData);
        setShowOpeningHint(true);
      } else {
        console.log('No se encontraron videos para el anime');
      }
    } catch (error) {
      console.error('Error fetching opening:', error);
    } finally {
      setIsLoadingOpening(false);
    }
  };

  // Agregar useEffect para manejar la obtención del opening
  useEffect(() => {
    const handleOpeningHint = async () => {
      if (showOpeningHint && !openingVideo && !isLoadingOpening && todaysAnime) {
        console.log('Intentando obtener opening por useEffect');
        await fetchOpening();
      }
    };

    handleOpeningHint();
  }, [showOpeningHint, openingVideo, isLoadingOpening, todaysAnime]);

  // Agregar useEffect para manejar cuando los intentos llegan a 0
  useEffect(() => {
    if (openingAttempts === 0 && !showOpeningHint) {
      console.log('Los intentos llegaron a 0, activando opening hint');
      setShowOpeningHint(true);
    }
  }, [openingAttempts, showOpeningHint]);

  console.log(todaysAnime, showEpisodeCountHint)

  // Agregar esta función para manejar el envío del formulario
  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim() || !todaysAnime) return;

    try {
      const response = await fetch('/api/lista');
      const allAnimes: AnimeData[] = await response.json();
      const guessedAnime = allAnimes.find(
        (anime) => anime.nombre.toLowerCase() === guessInput.toLowerCase()
      );

      if (guessedAnime) {
        submitGuess(guessedAnime);
      }
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  };

  return (
    <div className="w-full relative">
      {/* Main Game Container */}
      <div className="bg-amber-50/90 border-4 border-amber-900/30 rounded-xl p-6 shadow-xl relative">
        {/* Hint Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div
            className="flex flex-col items-center justify-center bg-white rounded-lg p-4 border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="text-sm font-medium">GENRE HINT</span>
            <span className="text-xs text-gray-600">IN {genreAttempts} TRIES</span>
          </div>
          <div
            className="flex flex-col items-center justify-center bg-white rounded-lg p-4 border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="text-sm font-medium">EPISODES HINT</span>
            <span className="text-xs text-gray-600">IN {episodeCountAttempts} TRIES</span>
          </div>
          <div
            className="flex flex-col items-center justify-center bg-white rounded-lg p-4 border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="text-sm font-medium">OPENING HINT</span>
            <span className="text-xs text-gray-600">
              {isLoadingOpening ? 'CARGANDO...' : `IN ${openingAttempts} TRIES`}
            </span>
          </div>
        </div>

        {/* Hints Display */}
        {todaysAnime && (showGenreHint || showEpisodeCountHint) && (
          <div className="mb-6 p-3 bg-[#ffe48c] rounded-lg text-center text-amber-900">
            {showGenreHint && (
              <p className="font-medium mb-1">
                Genres: {todaysAnime.genero.join(", ")}
              </p>
            )}
            {showEpisodeCountHint && (
              <p className="font-medium">
                Number of episodes: {todaysAnime.capitulos || 0}
              </p>
            )}
          </div>
        )}

        {/* Opening Player with Loading State */}
        {showOpeningHint && (
          <div className="mb-6 animate-fade-in">
            {isLoadingOpening ? (
              <div className="w-full bg-white rounded-lg shadow-md p-4 text-center">
                <p className="text-amber-900">Cargando opening...</p>
              </div>
            ) : openingVideo && videoId ? (
              <div className="flex flex-col items-center w-full">
                <div className="relative aspect-video w-full max-w-3xl mx-auto group">
                  <div className={`w-full h-full transition-all duration-300 ${!isBlurDisabled ? 'blur-xl' : ''}`}>
                    <YouTube 
                      videoId={videoId} 
                      opts={{
                        ...youtubeOpts,
                        width: '100%',
                        height: '100%'
                      }}
                      className="w-full h-full"
                      onError={(error) => console.error('Error en YouTube player:', error)}
                      onReady={() => console.log('YouTube player listo')}
                    />
                  </div>
                  <button
                    onClick={() => setIsBlurDisabled(prev => !prev)}
                    className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black/90 transition-colors"
                  >
                    {isBlurDisabled ? 'Activar Blur' : 'Desactivar Blur'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full bg-white rounded-lg shadow-md p-4 text-center">
                <p className="text-amber-900">No se encontró el opening para este anime.</p>
              </div>
            )}
          </div>
        )}

        {/* Guess Input */}
        <form onSubmit={handleGuessSubmit} className="relative">
          <div className="relative mb-4">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Anime name..."
              value={guessInput}
              onChange={handleInputChange}
              onFocus={() => guessInput.trim() && setShowSuggestions(true)}
              className="pr-12 py-6 text-lg border border-gray-200 bg-white rounded-lg"
              disabled={gameState !== "playing"}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 hover:bg-red-600"
              disabled={gameState !== "playing" || !guessInput.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {suggestions.map((suggestion, index) => {
                // Fetch image when suggestion is rendered
                fetchAnimeImage(suggestion.nombre);
                
                return (
                  <div
                    key={index}
                    className="flex items-center p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="w-10 h-10 relative mr-3 flex-shrink-0">
                      {loadingImages[suggestion.nombre] ? (
                        <div className="w-full h-full bg-gray-200 animate-pulse rounded" />
                      ) : (
                        <Image
                          src={imageCache[suggestion.nombre] || '/placeholder.jpg'}
                          alt={suggestion.nombre}
                          fill
                          className="object-cover rounded"
                          sizes="40px"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.nombre}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </form>

        {/* Success Count */}
        <div className="flex justify-center items-center gap-2 text-blue-500 mb-4">
          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          <p className="text-sm">{successCount} people have guessed it!</p>
          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
        </div>

        {/* Header row */}
        <div className="bg-blue-100 border border-blue-200 rounded-lg p-2 mb-4">
          <div className="grid grid-cols-8 gap-1">
            {[
              "ANIME",
              "GENRE",
              "DEMOGRAPHIC",
              "STUDIO",
              "START YEAR",
              "END YEAR",
              "EPISODES",
              "AUTHOR",
            ].map((label, index) => (
              <div 
                key={index} 
                className="text-[10px] leading-tight font-medium text-center text-blue-800"
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Guesses */}
        {guessHistory.map((anime, index) => (
          <div key={index} className="mb-2">
            {todaysAnime && (
              <CharacterAttributesTable
                guessedCharacter={anime}
                targetCharacter={todaysAnime}
                showHeader={false}
              />
            )}
          </div>
        ))}

        {/* Color Legend */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
          <h3 className="text-center font-medium mb-3">Color Indicators</h3>
          <div className="flex justify-center items-center gap-6">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-green-500 mb-1 rounded"></div>
              <span className="text-xs">Correct</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-yellow-400 mb-1 rounded"></div>
              <span className="text-xs">Partial</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-red-500 mb-1 rounded"></div>
              <span className="text-xs">Incorrect</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-red-800 flex items-center justify-center mb-1 rounded">
                <ArrowUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs">Higher</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-red-800 flex items-center justify-center mb-1 rounded">
                <ArrowDown className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs">Lower</span>
            </div>
          </div>
        </div>

        {/* Yesterday's Anime */}
        <div className="text-center mt-4 text-amber-800">
          <p>
            {yesterdaysAnime ? `Yesterday's anime was: #${yesterdaysAnime.nombre}` : 'Loading yesterday\'s anime...'}
          </p>
        </div>
      </div>

      {/* Success Card */}
      {gameState === "won" && todaysAnime && (
        <SuccessCard
          anime={{
            nombre: todaysAnime.nombre
          }}
          attemptCount={guessCount}
          playerRank={playerRank}
          nextCharacterTime={nextAnimeTime}
          timeZone={timeZone}
        />
      )}
    </div>
  )
}
