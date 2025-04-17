import { NextResponse } from 'next/server';
import animeData from '@/data/animedata.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testAnimeName = searchParams.get('test');

    // Si se proporciona un nombre de anime para pruebas, devolver ese anime
    if (testAnimeName) {
      const testAnime = animeData.find(anime => 
        anime.nombre.toLowerCase().includes(testAnimeName.toLowerCase())
      );

      if (testAnime) {
        console.log(`Devolviendo ${testAnime.nombre} como anime del día para pruebas`);
        return NextResponse.json(testAnime);
      }
    }

    // Seleccionar un anime aleatorio
    const randomIndex = Math.floor(Math.random() * animeData.length);
    const selectedAnime = animeData[randomIndex];
    
    console.log(`Devolviendo ${selectedAnime.nombre} como anime del día (aleatorio)`);
    return NextResponse.json(selectedAnime);
  } catch (error) {
    console.error('Error al obtener el anime del día:', error);
    return NextResponse.json({ error: 'Error al obtener el anime del día' }, { status: 500 });
  }
}
