import prisma from '../lib/db'
import animeData from '../data/animedata.json'

async function main() {
  try {
    // Limpiar la base de datos
    await prisma.guess.deleteMany()
    await prisma.game.deleteMany()
    await prisma.anime.deleteMany()

    // Insertar los animes
    for (const anime of animeData) {
      await prisma.anime.create({
        data: {
          nombre: anime.nombre,
          genero: anime.genero,
          demografia: anime.demografia,
          estudioAnimacion: anime.estudioAnimacion,
          añoDebut: anime.añoDebut,
          añoFinalizacion: anime.añoFinalizacion,
          capitulos: anime.capitulos,
          autor: anime.autor,
        },
      })
    }

    console.log('Database seeded successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 