"use client"

import { Button } from "@/components/ui/button"
import { Sword, Tv } from "lucide-react"

interface HintButtonsProps {
  onGenreHint: () => void
  onEpisodeCountHint: () => void
  genreAttempts: number
  episodeCountAttempts: number
}

export default function HintButtons({
  onGenreHint,
  onEpisodeCountHint,
  genreAttempts,
  episodeCountAttempts,
}: HintButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {genreAttempts > 0 && (
        <Button
          variant="outline"
          className="bg-gray-100 border-gray-300 h-auto py-3 flex flex-col items-center"
          onClick={onGenreHint}
        >
          <Sword className="h-6 w-6 mb-1 text-gray-600" />
          <div className="text-xs text-center text-gray-700">
            PISTA DE GÉNERO
            <br />
            EN {genreAttempts} INTENTOS
          </div>
        </Button>
      )}

      {episodeCountAttempts > 0 && (
        <Button
          variant="outline"
          className="bg-gray-100 border-gray-300 h-auto py-3 flex flex-col items-center"
          onClick={onEpisodeCountHint}
        >
          <Tv className="h-6 w-6 mb-1 text-gray-600" />
          <div className="text-xs text-center text-gray-700">
            PISTA DE CAPÍTULOS
            <br />
            EN {episodeCountAttempts} INTENTOS
          </div>
        </Button>
      )}
    </div>
  )
}
