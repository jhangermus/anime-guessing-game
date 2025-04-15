import Image from "next/image"
import { cn } from "@/lib/utils"

type CharacterAttributes = {
  id: number
  name: string
  alias: string
  anime: string
  avatar: string
  gender: string
  affiliation: string
  devilFruit: string
  haki: string
  bounty: string
  height: string
  origin: string
  firstArc: string
}

interface CharacterAttributesTableProps {
  guessedCharacter: CharacterAttributes
  targetCharacter: CharacterAttributes
  showHeader?: boolean
}

export default function CharacterAttributesTable({
  guessedCharacter,
  targetCharacter,
  showHeader = false,
}: CharacterAttributesTableProps) {
  // Helper function to determine the comparison status
  const getComparisonStatus = (
    guessedValue: string,
    targetValue: string,
    isNumeric = false,
  ): "correct" | "partial" | "incorrect" | "higher" | "lower" => {
    if (guessedValue === targetValue) {
      return "correct"
    }

    if (isNumeric) {
      // Extract numeric values for comparison
      const extractNumber = (str: string) => {
        const match = str.match(/\d+(\.\d+)?/)
        return match ? Number.parseFloat(match[0]) : 0
      }

      const guessedNum = extractNumber(guessedValue)
      const targetNum = extractNumber(targetValue)

      if (guessedNum > targetNum) {
        return "lower" // The guessed value is higher, so the target is lower
      } else {
        return "higher" // The guessed value is lower, so the target is higher
      }
    }

    // Check for partial matches (e.g., both contain "Straw Hat")
    if (
      guessedValue.toLowerCase().includes(targetValue.toLowerCase()) ||
      targetValue.toLowerCase().includes(guessedValue.toLowerCase())
    ) {
      return "partial"
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
    if (status === "higher") return "▲"
    if (status === "lower") return "▼"
    return null
  }

  // Define the attributes to display in the table
  const attributes = [
    {
      label: "PERSONAJE",
      guessedValue: guessedCharacter.avatar,
      targetValue: targetCharacter.avatar,
      isImage: true,
    },
    {
      label: "GÉNERO",
      guessedValue: guessedCharacter.gender,
      targetValue: targetCharacter.gender,
    },
    {
      label: "AFILIACIÓN",
      guessedValue: guessedCharacter.affiliation,
      targetValue: targetCharacter.affiliation,
    },
    {
      label: "FRUTA DEL DIABLO",
      guessedValue: guessedCharacter.devilFruit,
      targetValue: targetCharacter.devilFruit,
    },
    {
      label: "HAKI",
      guessedValue: guessedCharacter.haki,
      targetValue: targetCharacter.haki,
    },
    {
      label: "ÚLTIMA RECOMPENSA",
      guessedValue: guessedCharacter.bounty,
      targetValue: targetCharacter.bounty,
      isNumeric: true,
    },
    {
      label: "ALTURA",
      guessedValue: guessedCharacter.height,
      targetValue: targetCharacter.height,
      isNumeric: true,
    },
    {
      label: "ORIGEN",
      guessedValue: guessedCharacter.origin,
      targetValue: targetCharacter.origin,
    },
    {
      label: "PRIMER ARCO",
      guessedValue: guessedCharacter.firstArc,
      targetValue: targetCharacter.firstArc,
    },
  ]

  return (
    <div className="w-full">
      <div className="grid grid-cols-9 gap-1">
        {/* Header row - only shown if showHeader is true */}
        {showHeader &&
          attributes.map((attr, index) => (
            <div key={`header-${index}`} className="text-xs font-medium text-center text-gray-700 truncate px-1">
              {attr.label}
            </div>
          ))}

        {/* Character attributes row */}
        {attributes.map((attr, index) => {
          const status = attr.isImage
            ? guessedCharacter.id === targetCharacter.id
              ? "correct"
              : "incorrect"
            : getComparisonStatus(attr.guessedValue, attr.targetValue, attr.isNumeric)

          const bgColor = getBackgroundColor(status)
          const directionIcon = getDirectionIcon(status)

          return (
            <div
              key={`attr-${index}`}
              className={cn("h-16 flex items-center justify-center text-center p-1 rounded-md", bgColor)}
            >
              {attr.isImage ? (
                <div className="w-12 h-12 relative">
                  <Image
                    src={attr.guessedValue || "/placeholder.svg"}
                    alt="Character"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              ) : (
                <div className="text-xs font-medium">
                  {directionIcon && <div className="text-lg font-bold">{directionIcon}</div>}
                  {attr.guessedValue}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
