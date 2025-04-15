"use client"

import { Button } from "@/components/ui/button"
import { Book, Apple } from "lucide-react"

interface HintButtonsProps {
  onFirstAppearanceHint: () => void
  onDevilFruitHint: () => void
  firstAppearanceAttempts: number
  devilFruitAttempts: number
}

export default function HintButtons({
  onFirstAppearanceHint,
  onDevilFruitHint,
  firstAppearanceAttempts,
  devilFruitAttempts,
}: HintButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Button
        variant="outline"
        className="bg-gray-100 border-gray-300 h-auto py-3 flex flex-col items-center"
        onClick={onFirstAppearanceHint}
      >
        <Book className="h-6 w-6 mb-1 text-gray-600" />
        <div className="text-xs text-center text-gray-700">
          PRIMERA PISTA DE LA APARICIÓN
          <br />
          EN {firstAppearanceAttempts} INTENTOS
        </div>
      </Button>

      <Button
        variant="outline"
        className="bg-gray-100 border-gray-300 h-auto py-3 flex flex-col items-center"
        onClick={onDevilFruitHint}
      >
        <Apple className="h-6 w-6 mb-1 text-gray-600" />
        <div className="text-xs text-center text-gray-700">
          FRUTA DEL DIABLO PISTA
          <br />
          EN {devilFruitAttempts} INTENTOS
        </div>
      </Button>
    </div>
  )
}
