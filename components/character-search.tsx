"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import Image from "next/image"

type Character = {
  id: number
  name: string
  alias: string
  anime: string
  avatar: string
}

interface CharacterSearchProps {
  onSelect: (character: Character) => void
  disabled?: boolean
}

export default function CharacterSearch({ onSelect, disabled = false }: CharacterSearchProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Character[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/characters?q=${encodeURIComponent(query)}`)
        // const data = await response.json()

        // For demo purposes, we'll simulate an API response
        const mockData = {
          characters: [
            {
              id: 7,
              name: "Nico Robin",
              alias: "Miss All Sunday",
              anime: "One Piece",
              avatar: "/placeholder.svg?height=40&width=40",
            },
            {
              id: 6,
              name: "Tony Tony Chopper",
              alias: "El Amante del Algodón de Azúcar",
              anime: "One Piece",
              avatar: "/placeholder.svg?height=40&width=40",
            },
            {
              id: 11,
              name: "Marco",
              alias: "Marco el Ave Inmortal",
              anime: "One Piece",
              avatar: "/placeholder.svg?height=40&width=40",
            },
            {
              id: 4,
              name: "Usopp",
              alias: "Hana Arashi",
              anime: "One Piece",
              avatar: "/placeholder.svg?height=40&width=40",
            },
            {
              id: 12,
              name: "Pedro",
              alias: "",
              anime: "One Piece",
              avatar: "/placeholder.svg?height=40&width=40",
            },
          ]
            .filter(
              (char) =>
                char.name.toLowerCase().includes(query.toLowerCase()) ||
                char.alias.toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 5),
        }

        setSuggestions(mockData.characters)
        setShowSuggestions(mockData.characters.length > 0)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchSuggestions()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleSuggestionClick = (character: Character) => {
    setQuery(character.name)
    setShowSuggestions(false)
    onSelect(character)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (suggestions.length > 0) {
      onSelect(suggestions[0])
    }
    setShowSuggestions(false)
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Character name, alias, epithet..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.trim() && setShowSuggestions(true)}
            className="pr-12 py-6 text-lg border-2 border-amber-900/20 bg-white"
            disabled={disabled}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 hover:bg-red-600"
            disabled={disabled || !query.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((character) => (
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
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No characters found</div>
          )}
        </div>
      )}
    </div>
  )
}
