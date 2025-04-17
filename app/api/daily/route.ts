import { NextResponse } from 'next/server';
import animeData from '@/data/animedata.json';

export async function GET() {
  try {
    // Temporalmente devolver Naruto para pruebas
    const testAnime = animeData.find(anime => 
      anime.nombre.toLowerCase().includes('naruto') &&
      !anime.nombre.toLowerCase().includes('shippuden') // Buscamos el Naruto original
    );

    if (testAnime) {
      console.log('Devolviendo Naruto como anime del día para pruebas');
      return NextResponse.json(testAnime);
    }

    // Si por alguna razón no se encuentra Naruto, usar la lógica original
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const animeIndex = dayOfYear % animeData.length;
    
    return NextResponse.json(animeData[animeIndex]);
  } catch (error) {
    console.error('Error al obtener el anime del día:', error);
    return NextResponse.json({ error: 'Error al obtener el anime del día' }, { status: 500 });
  }
}
