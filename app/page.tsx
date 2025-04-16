import AnimeGuessingGame from "@/components/anime-guessing-game"

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-auto">
      <div 
        className="absolute inset-0 -z-10 fixed"
        style={{
          backgroundImage: "url('/background.jpg')",
          backgroundSize: '1920px 1080px',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          filter: 'brightness(0.8)'
        }}
      />
      <div className="relative z-10 w-full max-w-3xl">
        <AnimeGuessingGame />
      </div>
    </main>
  )
}
