import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Obtener el juego de hoy
    let game = await prisma.game.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      include: {
        anime: true
      }
    })

    // Obtener el juego de ayer
    const yesterdayGame = await prisma.game.findFirst({
      where: {
        date: {
          gte: yesterday,
          lt: today
        }
      },
      include: {
        anime: true
      }
    })

    // Si no hay juego para hoy, crear uno nuevo
    if (!game) {
      // Si hay un juego de ayer, usar un anime diferente
      const animes = await prisma.anime.findMany()
      let randomAnime
      
      if (yesterdayGame) {
        // Filtrar para excluir el anime de ayer
        const availableAnimes = animes.filter(anime => anime.id !== yesterdayGame.animeId)
        randomAnime = availableAnimes[Math.floor(Math.random() * availableAnimes.length)]
      } else {
        randomAnime = animes[Math.floor(Math.random() * animes.length)]
      }

      game = await prisma.game.create({
        data: {
          animeId: randomAnime.id,
          date: today
        },
        include: {
          anime: true
        }
      })
    }

    return NextResponse.json({
      todayGame: game,
      yesterdayGame: yesterdayGame
    })
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json({ error: 'Error fetching game' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const guess = await prisma.guess.create({
      data: {
        gameId: data.gameId,
        animeId: data.animeId
      },
      include: {
        anime: true
      }
    })
    return NextResponse.json(guess)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating guess' }, { status: 500 })
  }
} 