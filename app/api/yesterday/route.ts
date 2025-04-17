import { NextResponse } from 'next/server';
import animes from '@/data/animedata.json';

export async function GET() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dayOfYear = Math.floor(
    (Date.UTC(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()) -
     Date.UTC(yesterday.getFullYear(), 0, 0)) / 86400000
  );

  const index = dayOfYear % animes.length;
  const animeDeAyer = animes[index];

  return NextResponse.json(animeDeAyer);
} 