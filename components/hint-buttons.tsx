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
          className="bg-gray-100 border-gray-300 h-auto py-3 flex flex-col items-center cursor-default pointer-events-none"
        >
          <Sword className="h-6 w-6 mb-1 text-gray-600" />
          <div className="text-xs text-center text-gray-700">
            GENRE HINT
            <br />
            IN {genreAttempts} TRIES
          </div>
        </Button>
      )}

      {episodeCountAttempts > 0 && (
        <Button
          variant="outline"
          className="bg-gray-100 border-gray-300 h-auto py-3 flex flex-col items-center cursor-default pointer-events-none"
        >
          <Tv className="h-6 w-6 mb-1 text-gray-600" />
          <div className="text-xs text-center text-gray-700">
            EPISODES HINT
            <br />
            IN {episodeCountAttempts} TRIES
          </div>
        </Button>
      )}
    </div>
  )
}
