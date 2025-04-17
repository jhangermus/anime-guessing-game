"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart3, Flame, HelpCircle, ClipboardList, Send, X, ArrowUp, ArrowDown } from "lucide-react"
import Image from "next/image"
import CharacterAttributesTable from "./character-attributes-table"
import HintButtons from "./hint-buttons"
import SuccessCard from "./success-card"

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
  }
}

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
  const [genreAttempts, setGenreAttempts] = useState(4)
  const [episodeCountAttempts, setEpisodeCountAttempts] = useState(7)
  const [showGenreHint, setShowGenreHint] = useState(false)
  const [showEpisodeCountHint, setShowEpisodeCountHint] = useState(false)

  // Initialize the game with today's anime and yesterday's anime
  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        // Fetch today's anime
        const todayResponse = await fetch('/api/daily')
        const todayData = await todayResponse.json()
        setTodaysAnime(convertJSONToAnimeData(todayData))

        // Fetch yesterday's anime
        const yesterdayResponse = await fetch('/api/yesterday')
        const yesterdayData = await yesterdayResponse.json()
        setYesterdaysAnime(convertJSONToAnimeData(yesterdayData))
      } catch (error) {
        console.error('Error fetching anime data:', error)
      }
    }

    fetchAnimeData()
  }, [])

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

  // Handle search input changes
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setGuessInput(value)

    if (value.length > 0) {
      try {
        const response = await fetch(`/api/busqueda?q=${encodeURIComponent(value)}`)
        const animeNames = await response.json()
        
        // Obtener los datos completos de los animes sugeridos
        const listaResponse = await fetch('/api/lista')
        const allAnimes: AnimeData[] = await listaResponse.json()
        
        const filteredAnimes = allAnimes.filter(anime => 
          animeNames.includes(anime.nombre) && 
          !guessHistory.some(guessed => guessed.nombre === anime.nombre)
        )
        
        setSuggestions(filteredAnimes)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (anime: AnimeData) => {
    setGuessInput(anime.nombre)
    setShowSuggestions(false)
    submitGuess(anime)
  }

  // Handle guess submission
  const submitGuess = async (anime: AnimeData) => {
    if (gameState !== "playing") return

    // Agregar el nuevo intento al principio del historial
    setGuessHistory([anime, ...guessHistory])
    setGuessCount(prev => prev + 1)

    // Solo terminar el juego si se adivina correctamente
    if (anime.nombre === todaysAnime?.nombre) {
      setGameState("won")
    }

    // Disminuir los intentos de pistas si el intento es incorrecto
    if (anime.nombre !== todaysAnime?.nombre) {
      // Manejar pista de género
      if (genreAttempts > 0) {
        const newGenreAttempts = genreAttempts - 1
        setGenreAttempts(newGenreAttempts)
        if (newGenreAttempts === 0) {
          setShowGenreHint(true)
        }
      }

      // Manejar pista de capítulos
      if (episodeCountAttempts > 0) {
        const newEpisodeAttempts = episodeCountAttempts - 1
        setEpisodeCountAttempts(newEpisodeAttempts)
        if (newEpisodeAttempts === 0) {
          setShowEpisodeCountHint(true)
        }
      }
    }

    setGuessInput("")
    setSuggestions([])
    setShowSuggestions(false)

    // Mantener el foco en el input si el juego sigue activo
    if (gameState === "playing") {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 0)
    }
  }

  // Handle clicks outside the suggestions dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guessInput.trim() || !todaysAnime) return

    try {
      const response = await fetch('/api/lista')
      const allAnimes: AnimeData[] = await response.json()
      const guessedAnime = allAnimes.find(
        (anime) => anime.nombre.toLowerCase() === guessInput.toLowerCase()
      )

      if (guessedAnime) {
        submitGuess(guessedAnime)
      }
    } catch (error) {
      console.error('Error submitting guess:', error)
    }
  }
  console.log(todaysAnime, showEpisodeCountHint)
  return (
    <div className="w-full relative">
      {/* Main Game Container */}
      <div className="bg-amber-50/90 border-4 border-amber-900/30 rounded-xl p-6 shadow-xl relative">

        {/* Game Title and Instructions */}
        <div className="bg-amber-100 border-2 border-amber-900/20 rounded-xl p-4 mb-6">
          <h1 className="text-center text-xl font-bold text-amber-900 mb-2">
            ¡ADIVINA EL ANIME HOY!
          </h1>
          <p className="text-center text-amber-800">Escribe el nombre del anime.</p>
          {/* Hints Section */}
          {todaysAnime && (showGenreHint || showEpisodeCountHint) && (
            <div className="mt-3 p-2 bg-amber-200 rounded-lg text-center text-amber-900">
              {showGenreHint && (
                <p className="font-medium mb-1">
                  Géneros: {todaysAnime.genero.join(", ")}
                </p>
              )}
              {showEpisodeCountHint && (
                <p className="font-medium">
                  Número de capítulos: {todaysAnime.capitulos || 0}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Hint Buttons */}
        <HintButtons
          onGenreHint={() => setShowGenreHint(true)}
          onEpisodeCountHint={() => setShowEpisodeCountHint(true)}
          genreAttempts={genreAttempts}
          episodeCountAttempts={episodeCountAttempts}
        />

        {/* Guess Input Form with Autocomplete */}
        <form onSubmit={handleGuessSubmit} className="mb-6 relative">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Nombre del anime..."
              value={guessInput}
              onChange={handleInputChange}
              onFocus={() => guessInput.trim() && setShowSuggestions(true)}
              className="pr-12 py-6 text-lg border-2 border-amber-900/20 bg-white"
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
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {suggestions.map((anime) => (
                <div
                  key={anime.nombre}
                  className="flex items-center p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                  onClick={() => handleSuggestionClick(anime)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{anime.nombre}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Character Attributes Tables - Stacked vertically */}
        {guessHistory.length > 0 && todaysAnime && (
          <div className="mb-6 space-y-4">
            {/* Stats */}
            <div className="flex justify-center items-center gap-2 text-blue-500 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <p className="text-sm">{successCount} ¡personas ya lo adivinaron!</p>
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            </div>

            {/* Header row - shown only once at the top */}
            <div className="bg-blue-100 border border-blue-500 rounded-md p-1">
              <div className="grid grid-cols-8 gap-1">
                {[
                  "ANIME",
                  "GÉNERO",
                  "DEMOGRAFÍA",
                  "ESTUDIO",
                  "AÑO DEBUT",
                  "AÑO FIN",
                  "CAPÍTULOS",
                  "AUTOR",
                ].map((label, index) => (
                  <div 
                    key={index} 
                    className="text-[10px] leading-tight font-medium text-center text-blue-800 px-1"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Anime guesses - without headers */}
            {guessHistory.map((anime, index) => (
              <div key={index} className="mb-2">
                <CharacterAttributesTable
                  guessedCharacter={anime}
                  targetCharacter={todaysAnime}
                  showHeader={false}
                />
              </div>
            ))}

            {/* Color Legend */}
            <div className="mt-4 bg-white border-2 border-amber-900/20 rounded-lg p-4">
              <h3 className="text-center font-medium mb-2">Indicadores de color</h3>
              <div className="flex justify-center items-center gap-4 flex-wrap">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-500 mb-1 rounded"></div>
                  <span className="text-xs">Correcto</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-yellow-400 mb-1 rounded"></div>
                  <span className="text-xs">Parcial</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-500 mb-1 rounded"></div>
                  <span className="text-xs">Incorrecto</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-800 flex items-center justify-center mb-1 rounded">
                    <ArrowUp className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs">Más alto</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-red-800 flex items-center justify-center mb-1 rounded">
                    <ArrowDown className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs">Baja</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Yesterday's Anime */}
        <div className="text-center mt-4 text-amber-800">
          <p>
            {yesterdaysAnime ? `El anime de ayer fue: ${yesterdaysAnime.nombre}` : 'Cargando anime de ayer...'}
          </p>
        </div>
      </div>

      {/* Success Card - Only shown when game is won */}
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
