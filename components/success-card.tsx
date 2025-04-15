"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BarChart2 } from "lucide-react"

interface SuccessCardProps {
  character: {
    name: string
    avatar: string
  }
  attemptCount: number
  playerRank: number
  nextCharacterTime: {
    hours: number
    minutes: number
    seconds: number
  }
  timeZone: string
}

export default function SuccessCard({
  character,
  attemptCount,
  playerRank,
  nextCharacterTime,
  timeZone,
}: SuccessCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Scroll to the card when it appears
  useEffect(() => {
    if (cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }, 300)
    }
  }, [])

  return (
    <div ref={cardRef} className="bg-green-500 rounded-lg p-6 text-center shadow-lg max-w-md mx-auto mt-8 mb-4">
      <h2 className="text-3xl font-bold mb-4 text-black">gg ez</h2>

      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 rounded-lg overflow-hidden">
          <Image
            src={character.avatar || "/placeholder.svg?height=64&width=64"}
            alt={character.name}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
      </div>

      <p className="text-lg mb-4">
        Adivinaste <span className="font-bold">{character.name}</span>
      </p>

      <p className="text-sm mb-2">Eres el #{playerRank} que ha encontrado el personaje de hoy.</p>

      <p className="text-sm mb-4">
        Número de intentos: <span className="font-bold">{attemptCount}</span>
      </p>

      <Button className="bg-white text-green-700 hover:bg-gray-100 mb-6 px-6">
        <BarChart2 className="mr-2 h-4 w-4" /> Estadísticas
      </Button>

      <div className="border-t border-green-400 pt-4">
        <p className="text-sm font-medium mb-2">Siguiente personaje en</p>
        <p className="text-3xl font-bold mb-2">
          {String(nextCharacterTime.hours).padStart(2, "0")}:{String(nextCharacterTime.minutes).padStart(2, "0")}:
          {String(nextCharacterTime.seconds).padStart(2, "0")}
        </p>
        <p className="text-xs text-green-800">Zona horaria: {timeZone}</p>
      </div>
    </div>
  )
}
