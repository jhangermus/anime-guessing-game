import { NextRequest, NextResponse } from 'next/server';
import animes from '@/data/animedata.json';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  const sugerencias = animes
    .filter(anime => anime.nombre.toLowerCase().includes(query))
    .slice(0, 10)
    .map(anime => anime.nombre);

  return NextResponse.json(sugerencias);
}
