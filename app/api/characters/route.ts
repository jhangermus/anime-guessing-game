import { NextResponse } from "next/server"

// This would typically come from a database
const animeCharacters = [
  {
    id: 1,
    name: "Monkey D. Luffy",
    alias: "Straw Hat",
    anime: "One Piece",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Roronoa Zoro",
    alias: "Pirate Hunter",
    anime: "One Piece",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Nami",
    alias: "Cat Burglar",
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
    id: 5,
    name: "Sanji",
    alias: "Black Leg",
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
    id: 7,
    name: "Nico Robin",
    alias: "Miss All Sunday",
    anime: "One Piece",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 8,
    name: "Franky",
    alias: "Cyborg",
    anime: "One Piece",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 9,
    name: "Brook",
    alias: "Soul King",
    anime: "One Piece",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 10,
    name: "Jinbe",
    alias: "Knight of the Sea",
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
    id: 12,
    name: "Pedro",
    alias: "",
    anime: "One Piece",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  // More characters would be here in a real application
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ characters: [] })
  }

  const filteredCharacters = animeCharacters.filter(
    (character) =>
      character.name.toLowerCase().includes(query.toLowerCase()) ||
      (character.alias && character.alias.toLowerCase().includes(query.toLowerCase())),
  )

  // Limit to 5 suggestions
  return NextResponse.json({
    characters: filteredCharacters.slice(0, 5),
  })
}
