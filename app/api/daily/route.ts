import { NextResponse } from 'next/server';
import animes from '@/data/animedata.json';

export async function GET() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
     Date.UTC(today.getFullYear(), 0, 0)) / 86400000
  );

  const index = dayOfYear % animes.length;
  const animeDelDia = animes[index];

  return NextResponse.json(animeDelDia);
}
