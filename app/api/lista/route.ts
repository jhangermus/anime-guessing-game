import { NextResponse } from 'next/server';
import animes from '@/data/animedata.json';

export async function GET() {
  return NextResponse.json(animes);
}
