import AnimeGuessingGame from "@/components/anime-guessing-game"

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "url('/background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.9)'
        }}
      />
      <div className="relative z-10 w-full max-w-3xl">
        <AnimeGuessingGame />
      </div>
    </main>
  )
}
