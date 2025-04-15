import AnimeGuessingGame from "@/components/anime-guessing-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-orange-50 to-amber-100">
      <AnimeGuessingGame />
    </main>
  )
}
