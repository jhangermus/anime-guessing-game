import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const animes = await prisma.anime.findMany()
    return NextResponse.json(animes)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching animes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const anime = await prisma.anime.create({
      data: {
        nombre: data.nombre,
        genero: data.genero,
        demografia: data.demografia,
        estudioAnimacion: data.estudioAnimacion,
        añoDebut: data.añoDebut,
        añoFinalizacion: data.añoFinalizacion,
        capitulos: data.capitulos,
        autor: data.autor,
      },
    })
    return NextResponse.json(anime)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating anime' }, { status: 500 })
  }
} 