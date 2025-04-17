"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BarChart2 } from "lucide-react"

interface SuccessCardProps {
  anime: {
    nombre: string
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
  anime,
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
      <h2 className="text-3xl font-bold mb-4 text-black">Congratulations!</h2>

      <p className="text-lg mb-4">
        You guessed <span className="font-bold">{anime.nombre}</span>
      </p>

      <p className="text-sm mb-2">You are #{playerRank} to find today's anime.</p>

      <p className="text-sm mb-4">
        Number of attempts: <span className="font-bold">{attemptCount}</span>
      </p>

      <Button className="bg-white text-green-700 hover:bg-gray-100 mb-6 px-6">
        <BarChart2 className="mr-2 h-4 w-4" /> Statistics
      </Button>

      <div className="border-t border-green-400 pt-4">
        <p className="text-sm font-medium mb-2">Next anime in</p>
        <p className="text-3xl font-bold mb-2">
          {String(nextCharacterTime.hours).padStart(2, "0")}:{String(nextCharacterTime.minutes).padStart(2, "0")}:
          {String(nextCharacterTime.seconds).padStart(2, "0")}
        </p>
        <p className="text-xs text-green-800">Timezone: {timeZone}</p>
      </div>
    </div>
  )
}
