import Image from "next/image"
import { cn } from "@/lib/utils"

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

interface AnimeAttributesTableProps {
  guessedCharacter: AnimeData
  targetCharacter: AnimeData
  showHeader?: boolean
}

export default function CharacterAttributesTable({
  guessedCharacter,
  targetCharacter,
  showHeader = false,
}: AnimeAttributesTableProps) {
  // Helper function to determine the comparison status
  const getComparisonStatus = (
    guessedValue: string | number | string[] | null,
    targetValue: string | number | string[] | null,
    isNumeric = false,
    isArray = false,
  ): "correct" | "partial" | "incorrect" | "higher" | "lower" => {
    if (guessedValue === targetValue) {
      return "correct"
    }

    if (isArray) {
      const guessedArray = Array.isArray(guessedValue) ? guessedValue : JSON.parse(guessedValue as string)
      const targetArray = Array.isArray(targetValue) ? targetValue : JSON.parse(targetValue as string)
      
      // Sort arrays to ensure order doesn't matter
      const sortedGuessed = [...guessedArray].sort()
      const sortedTarget = [...targetArray].sort()
      
      // Check for exact match first
      if (sortedGuessed.length === sortedTarget.length && 
          sortedGuessed.every((value, index) => value.toLowerCase() === sortedTarget[index].toLowerCase())) {
        return "correct"
      }
      
      // Check for partial match
      const intersection = guessedArray.filter((x: string) => 
        targetArray.some((y: string) => y.toLowerCase() === x.toLowerCase())
      )
      if (intersection.length > 0) {
        return "partial"
      }
      
      return "incorrect"
    }

    if (isNumeric) {
      const guessedNum = Number(guessedValue)
      const targetNum = Number(targetValue)

      if (isNaN(guessedNum) || isNaN(targetNum)) {
        return "incorrect"
      }

      if (guessedNum > targetNum) {
        return "lower"
      } else {
        return "higher"
      }
    }

    // Check for partial matches in strings
    if (typeof guessedValue === 'string' && typeof targetValue === 'string') {
      if (
        guessedValue.toLowerCase().includes(targetValue.toLowerCase()) ||
        targetValue.toLowerCase().includes(guessedValue.toLowerCase())
      ) {
        return "partial"
      }
    }

    return "incorrect"
  }

  // Get the appropriate background color based on comparison status
  const getBackgroundColor = (status: "correct" | "partial" | "incorrect" | "higher" | "lower") => {
    switch (status) {
      case "correct":
        return "bg-green-500 text-white"
      case "partial":
        return "bg-yellow-400 text-black"
      case "incorrect":
        return "bg-red-500 text-white"
      case "higher":
        return "bg-red-800 text-white"
      case "lower":
        return "bg-red-800 text-white"
      default:
        return "bg-gray-200"
    }
  }

  // Get the appropriate icon for higher/lower
  const getDirectionIcon = (status: "correct" | "partial" | "incorrect" | "higher" | "lower") => {
    if (status === "higher") return "↑"
    if (status === "lower") return "↓"
    return null
  }

  // Helper function to determine text size based on content length
  const getTextSize = (value: string | number | string[] | null): string => {
    if (!value) return "text-sm";
    
    let textContent = Array.isArray(value) 
      ? value.join(", ")
      : value?.toString() || "";

    if (textContent.length > 30) return "text-xs";
    if (textContent.length > 20) return "text-[13px]";
    return "text-sm";
  }

  // Define the attributes to display in the table
  const attributes = [
    {
      label: "ANIME",
      guessedValue: guessedCharacter.nombre,
      targetValue: targetCharacter.nombre,
    },
    {
      label: "GÉNERO",
      guessedValue: guessedCharacter.genero,
      targetValue: targetCharacter.genero,
      isArray: true,
    },
    {
      label: "DEMOGRAFÍA",
      guessedValue: guessedCharacter.demografia,
      targetValue: targetCharacter.demografia,
    },
    {
      label: "ESTUDIO",
      guessedValue: guessedCharacter.estudio,
      targetValue: targetCharacter.estudio,
    },
    {
      label: "AÑO DEBUT",
      guessedValue: guessedCharacter.año_debut,
      targetValue: targetCharacter.año_debut,
      isNumeric: true,
    },
    {
      label: "AÑO FIN",
      guessedValue: guessedCharacter.año_finalizacion,
      targetValue: targetCharacter.año_finalizacion,
      isNumeric: true,
    },
    {
      label: "CAPÍTULOS",
      guessedValue: guessedCharacter.capitulos,
      targetValue: targetCharacter.capitulos,
      isNumeric: true,
    },
    {
      label: "AUTOR",
      guessedValue: guessedCharacter.autor,
      targetValue: targetCharacter.autor,
    },
  ]

  return (
    <div className="w-full">
      <div className="grid grid-cols-8 gap-1">
        {/* Header row - only shown if showHeader is true */}
        {showHeader &&
          attributes.map((attr, index) => (
            <div key={`header-${index}`} className="text-xs font-medium text-center text-gray-700 px-1 whitespace-normal">
              {attr.label}
            </div>
          ))}

        {/* Anime attributes row */}
        {attributes.map((attr, index) => {
          const status = getComparisonStatus(
            attr.guessedValue,
            attr.targetValue,
            attr.isNumeric,
            attr.isArray
          )

          const bgColor = getBackgroundColor(status)
          const directionIcon = getDirectionIcon(status)
          const textSize = getTextSize(attr.guessedValue)

          return (
            <div
              key={`attr-${index}`}
              className={cn(
                "min-h-[4rem] flex items-center justify-center text-center p-2 rounded-md",
                bgColor
              )}
            >
              <div className={cn("leading-tight font-medium w-full", textSize)}>
                {directionIcon && <div className="text-xl font-bold mb-1">{directionIcon}</div>}
                {Array.isArray(attr.guessedValue) 
                  ? attr.guessedValue.join(", ")
                  : attr.guessedValue === null 
                    ? "No finalizado" 
                    : attr.guessedValue}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
