"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart3, Flame, HelpCircle, ClipboardList, Send, X } from "lucide-react"
import Image from "next/image"
import CharacterAttributesTable from "./character-attributes-table"
import HintButtons from "./hint-buttons"
import SuccessCard from "./success-card"

// Expanded character database with more attributes
const animeCharacters = [
  {
    id: 1,
    name: "Monkey D. Luffy",
    alias: "Straw Hat",
    anime: "One Piece",
    hint: "Wants to be the Pirate King",
    avatar: "/placeholder.svg?height=40&width=40",
    gender: "Masculino",
    affiliation: "Piratas de Sombrero de Paja",
    devilFruit: "Gomu Gomu no Mi",
    haki: "Armament, Observation, Conqueror's",
    bounty: "₿ 3,000,000,000",
    height: "1m74",
    origin: "East Blue",
    firstArc: "Romance Dawn",
  },
  {
    id: 2,
    name: "Roronoa Zoro",
    alias: "Pirate Hunter",
    anime: "One Piece",
    hint: "Three-sword style swordsman",
    avatar: "/placeholder.svg?height=40&width=40",
    gender: "Masculino",
    affiliation: "Piratas de Sombrero de Paja",
    devilFruit: "Ninguno",
    haki: "Armament, Observation",
    bounty: "₿ 1,111,000,000",
    height: "1m81",
    origin: "East Blue",
    firstArc: "Romance Dawn",
  },
  {
    id: 3,
    name: "Nami",
    alias: "Cat Burglar",
    anime: "One Piece",
    hint: "Navigator who loves money and tangerines",
    avatar: "/placeholder.svg?height=40&width=40",
    gender: "Femenino",
    affiliation: "Piratas de Sombrero de Paja",
    devilFruit: "Ninguno",
    haki: "Ninguno",
    bounty: "₿ 366,000,000",
    height: "1m70",
    origin: "East Blue",
    firstArc: "Orange Town",
  },
  {
    id: 4,
    name: "Usopp",
    alias: "Hana Arashi",
    anime: "One Piece",
    hint: "Long-nosed sniper who tells tall tales",
    avatar: "/placeholder.svg?height=40&width=40",
    gender: "Masculino",
    affiliation: "Piratas de Sombrero de Paja",
    devilFruit: "Ninguno",
    haki: "Observation",
    bounty: "₿ 500,000,000",
    height: "1m76",
    origin: "East Blue",
    firstArc: "Syrup Village",
  },
  {
    id: 5,
    name: "Sanji",
    alias: "Black Leg",
    anime: "One Piece",
    hint: "Cook who only fights with his legs",
    avatar: "/placeholder.svg?height=40&width=40",
    gender: "Masculino",
    affiliation: "Piratas de Sombrero de Paja",
    devilFruit: "Ninguno",
    haki: "Armament, Observation",
    bounty: "₿ 1,032,000,000",
    height: "1m80",
    origin: "North Blue",
    firstArc: "Baratie",
  },
  {
    id: 6,
    name: "Tony Tony Chopper",
    alias: "El Amante del Algodón de Azúcar",
    anime: "One Piece",
    hint: "Reindeer doctor who ate the Human-Human Fruit",
    avatar: "/placeholder.svg?height=40&width=40",
    gender: "Masculino",
    affiliation: "Piratas de Sombrero de Paja",
    devilFruit: "Hito Hito no Mi",
    haki: "Ninguno",
    bounty: "₿ 1,000",
    height: "0m90",
    origin: "Grand Line",
    firstArc: "Drum Island",
  },
  {
    id: 7,
    name: "Nico Robin",
    alias: "Miss All Sunday",
    anime: "One Piece",
    hint: "Archaeologist who can sprout body parts",
    avatar: "/placeholder.svg?height=40&width=40",
    gender: "Femenino",
    affiliation: "Piratas de Sombrero de Paja",
    devilFruit: "Hana Hana no Mi",
    haki: "Ninguno",
    bounty: "₿ 930,000,000",
    height: "1m88",
    origin: "West Blue",
    firstArc: "Arabasta",
  },
  {
    id: 8,
    name: "Franky",
    alias: "Cyborg",
    anime: "One Piece",
    hint: "Shipwright with a cola-powered body",
    avatar: "/placeholder.svg?height=40&width=40",
    gender: "Masculino",
    affiliation: "Piratas de Sombrero de Paja",
    devilFruit: "Ninguno",
    haki: "Ninguno",
    bounty: "₿ 394,000,000",
    height: "2m40",
    origin: "South Blue",
    firstArc: "Water 7",
  },
  {
    id: 9,
    name: "Brook",
    alias: "Soul King",
    anime: "One Piece",
    hint: "Skeleton musician who can return from death once",
    avatar: "/placeholder.svg?height=40&width=40",
    gender: "Masculino",
    affiliation: "Piratas de Sombrero de Paja",
    devilFruit: "Yomi Yomi no Mi",
    haki: "Ninguno",
    bounty: "₿ 383,000,000",
    height: "2m77",
    origin: "West Blue",
    firstArc: "Thriller Bark",
  },
  {
    id: 10,
    name: "Jinbe",
    alias: "Knight of the Sea",
    anime: "One Piece",
    hint: "Fish-Man karate master and former Warlord",
    avatar: "/placeholder.svg?height=40&width=40",
    gender: "Masculino",
    affiliation: "Piratas de Sombrero de Paja",
    devilFruit: "Ninguno",
    haki: "Armament",
    bounty: "₿ 1,100,000,000",
    height: "3m01",
    origin: "Grand Line",
    firstArc: "Impel Down",
  },
  {
    id: 11,
    name: "Marco",
    alias: "Marco el Ave Inmortal",
    anime: "One Piece",
    hint: "First division commander of the Whitebeard Pirates",
    avatar: "/placeholder.svg?height=40&width=40",
    gender: "Masculino",
    affiliation: "Piratas de Barbablanca",
    devilFruit: "Tori Tori no Mi, Model: Phoenix",
    haki: "Armament, Observation",
    bounty: "₿ 1,374,000,000",
    height: "2m03",
    origin: "Grand Line",
    firstArc: "Marineford",
  },
  {
    id: 12,
    name: "Pedro",
    alias: "",
    anime: "One Piece",
    hint: "Jaguar mink from Zou and former captain of the Nox Pirates",
    avatar: "/placeholder.svg?height=40&width=40",
    gender: "Masculino",
    affiliation: "Guardianes del Bosque",
    devilFruit: "Ninguno",
    haki: "Ninguno",
    bounty: "₿ 382,000,000",
    height: "1m98",
    origin: "Grand Line",
    firstArc: "Zou",
  },
  {
    id: 13,
    name: "Vinsmoke Judge",
    alias: "El Rey de Germa",
    anime: "One Piece",
    hint: "Scientist and king of the Germa Kingdom",
    avatar: "/placeholder.svg?height=40&width=40",
    gender: "Masculino",
    affiliation: "Germa 66",
    devilFruit: "Ninguno",
    haki: "Ninguno",
    bounty: "₿ Unknown",
    height: "2m72",
    origin: "North Blue",
    firstArc: "Whole Cake Island",
  },
]

export default function AnimeGuessingGame() {
  const [todaysCharacter, setTodaysCharacter] = useState<(typeof animeCharacters)[0] | null>(null)
  const [guessInput, setGuessInput] = useState("")
  const [guessHistory, setGuessHistory] = useState<(typeof animeCharacters)[0][]>([])
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing")
  const [guessCount, setGuessCount] = useState(0)
  const [successCount, setSuccessCount] = useState(2955)
  const [playerRank, setPlayerRank] = useState(3997)
  const [yesterdaysCharacter, setYesterdaysCharacter] = useState({ id: 380, name: "Trafalgar Law" })
  const [showHint, setShowHint] = useState(false)
  const [suggestions, setSuggestions] = useState<typeof animeCharacters>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showColorLegend, setShowColorLegend] = useState(false)
  const [nextCharacterTime, setNextCharacterTime] = useState({ hours: 12, minutes: 1, seconds: 18 })
  const [timeZone, setTimeZone] = useState(":D")
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showFirstAppearanceHint, setShowFirstAppearanceHint] = useState(false)
  const [showDevilFruitHint, setShowDevilFruitHint] = useState(false)
  const [firstAppearanceAttempts] = useState(4)
  const [devilFruitAttempts] = useState(7)

  // Initialize the game with a random character
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * animeCharacters.length)
    setTodaysCharacter(animeCharacters[randomIndex])
  }, [])

  // Handle clicks outside the suggestions dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Countdown timer for next character
  useEffect(() => {
    if (gameState !== "won") return

    const timer = setInterval(() => {
      setNextCharacterTime((prev) => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setGuessInput(value)

    if (value.trim()) {
      // Filter characters based on input
      const filtered = animeCharacters.filter(
        (character) =>
          character.name.toLowerCase().includes(value.toLowerCase()) ||
          (character.alias && character.alias.toLowerCase().includes(value.toLowerCase())),
      )
      setSuggestions(filtered.slice(0, 5)) // Limit to 5 suggestions
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (character: (typeof animeCharacters)[0]) => {
    setGuessInput(character.name)
    setShowSuggestions(false)

    // Submit the guess automatically when selecting a suggestion
    if (todaysCharacter) {
      submitGuess(character)
    }
  }

  const submitGuess = (character: (typeof animeCharacters)[0]) => {
    if (gameState !== "playing") return

    // Add to guess history
    setGuessHistory([character, ...guessHistory])
    setGuessCount(guessCount + 1)
    setShowColorLegend(true)

    // Check if guess is correct
    if (character.id === todaysCharacter?.id) {
      setGameState("won")
      setSuccessCount(successCount + 1)
    } else if (guessCount >= 5) {
      setGameState("lost")
    }

    setGuessInput("")
  }

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!guessInput.trim() || !todaysCharacter) return

    // Find the character in our database
    const guessedCharacter = animeCharacters.find(
      (character) => character.name.toLowerCase() === guessInput.toLowerCase(),
    )

    if (guessedCharacter) {
      submitGuess(guessedCharacter)
    } else {
      // If character not found, just use the input as name
      const unknownCharacter = {
        id: -1,
        name: guessInput,
        alias: "",
        anime: "Unknown",
        hint: "",
        avatar: "/placeholder.svg?height=40&width=40",
        gender: "Unknown",
        affiliation: "Unknown",
        devilFruit: "Unknown",
        haki: "Unknown",
        bounty: "Unknown",
        height: "Unknown",
        origin: "Unknown",
        firstArc: "Unknown",
      }
      submitGuess(unknownCharacter)
    }

    setSuggestions([])
    setShowSuggestions(false)
  }

  const resetGame = () => {
    const randomIndex = Math.floor(Math.random() * animeCharacters.length)
    setTodaysCharacter(animeCharacters[randomIndex])
    setGuessInput("")
    setGuessHistory([])
    setGameState("playing")
    setGuessCount(0)
    setShowHint(false)
    setShowFirstAppearanceHint(false)
    setShowDevilFruitHint(false)
    setSuggestions([])
    setShowSuggestions(false)
    setShowColorLegend(false)
    setNextCharacterTime({ hours: 12, minutes: 1, seconds: 18 })
  }

  const handleFirstAppearanceHint = () => {
    setShowFirstAppearanceHint(true)
  }

  const handleDevilFruitHint = () => {
    setShowDevilFruitHint(true)
  }

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

          {showHint && todaysCharacter && (
            <div className="mt-3 p-2 bg-amber-200 rounded-lg text-center text-amber-900">
              <p className="font-medium">Hint: {todaysCharacter.hint}</p>
              <p className="text-sm">Anime: {todaysCharacter.anime}</p>
            </div>
          )}
        </div>

        {/* Hint Buttons */}
        <HintButtons
          onFirstAppearanceHint={handleFirstAppearanceHint}
          onDevilFruitHint={handleDevilFruitHint}
          firstAppearanceAttempts={firstAppearanceAttempts}
          devilFruitAttempts={devilFruitAttempts}
        />

        {/* Guess Input Form with Autocomplete */}
        <form onSubmit={handleGuessSubmit} className="mb-6 relative">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Nombre del personaje, alias, epíteto..."
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
              {suggestions.map((character) => (
                <div
                  key={character.id}
                  className="flex items-center p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                  onClick={() => handleSuggestionClick(character)}
                >
                  <div className="flex-shrink-0 w-10 h-10 mr-3">
                    <Image
                      src={character.avatar || "/placeholder.svg"}
                      alt={character.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{character.name}</div>
                    {character.alias && <div className="text-sm text-gray-500">Alias: {character.alias}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Character Attributes Tables - Stacked vertically */}
        {guessHistory.length > 0 && todaysCharacter && (
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
              <div className="grid grid-cols-9 gap-1">
                {[
                  "PERSONAJE",
                  "GÉNERO",
                  "AFILIACIÓN",
                  "FRUTA DEL DIABLO",
                  "HAKI",
                  "ÚLTIMA RECOMPENSA",
                  "ALTURA",
                  "ORIGEN",
                  "PRIMER ARCO",
                ].map((label, index) => (
                  <div key={index} className="text-xs font-medium text-center text-blue-800 truncate px-1">
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Character guesses - without headers */}
            {guessHistory.map((character, index) => (
              <div key={index} className="mb-2">
                <CharacterAttributesTable
                  guessedCharacter={character}
                  targetCharacter={todaysCharacter}
                  showHeader={false}
                />
              </div>
            ))}

            {/* Color Legend */}
            {showColorLegend && (
              <div className="relative mt-4 bg-white border-2 border-amber-900/20 rounded-lg p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => setShowColorLegend(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <h3 className="text-center font-medium mb-2">Indicadores de color</h3>
                <div className="flex justify-center items-center gap-4 flex-wrap">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-green-500 mb-1"></div>
                    <span className="text-xs">Correcto</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-yellow-400 mb-1"></div>
                    <span className="text-xs">Parcial</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-red-500 mb-1"></div>
                    <span className="text-xs">Incorrecto</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-red-800 flex items-center justify-center mb-1">
                      <span className="text-white">▲</span>
                    </div>
                    <span className="text-xs">Más alto</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-red-800 flex items-center justify-center mb-1">
                      <span className="text-white">▼</span>
                    </div>
                    <span className="text-xs">Baja</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Game Status */}
        {gameState === "lost" && (
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-center mb-6">
            <h2 className="text-xl font-bold text-red-700">Game Over!</h2>
            <p className="text-red-600">The character was: {todaysCharacter?.name}</p>
            <Button onClick={resetGame} className="mt-3 bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </div>
        )}

        {/* Yesterday's Character */}
        <div className="text-center mt-4 text-amber-800">
          <p>
            Yesterday&apos;s character was <span className="text-red-500">#{yesterdaysCharacter.id}</span>{" "}
            {yesterdaysCharacter.name}
          </p>
        </div>
      </div>

      {/* Success Card - Only shown when game is won */}
      {gameState === "won" && todaysCharacter && (
        <SuccessCard
          character={{
            name: todaysCharacter.name,
            avatar: todaysCharacter.avatar,
          }}
          attemptCount={guessCount}
          playerRank={playerRank}
          nextCharacterTime={nextCharacterTime}
          timeZone={timeZone}
        />
      )}
    </div>
  )
}
