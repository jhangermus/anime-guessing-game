import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const COUNTER_FILE = path.join(process.cwd(), 'data', 'counters.json');

async function readCounter() {
  try {
    const data = await fs.readFile(COUNTER_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe o hay un error, devolver valores por defecto
    return {
      currentDate: new Date().toISOString().split('T')[0],
      successCount: 0
    };
  }
}

async function writeCounter(data: any) {
  await fs.writeFile(COUNTER_FILE, JSON.stringify(data, null, 2));
}

async function resetCounterIfNeeded(counter: any) {
  const today = new Date().toISOString().split('T')[0];
  if (counter.currentDate !== today) {
    counter.currentDate = today;
    counter.successCount = 0;
    await writeCounter(counter);
  }
  return counter;
}

export async function GET() {
  try {
    const counter = await readCounter();
    const updatedCounter = await resetCounterIfNeeded(counter);
    return NextResponse.json({ count: updatedCounter.successCount });
  } catch (error) {
    console.error('Error getting success count:', error);
    return NextResponse.json({ error: 'Error getting success count' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { isCorrect } = await req.json();
    
    if (!isCorrect) {
      return NextResponse.json({ success: true });
    }

    const counter = await readCounter();
    await resetCounterIfNeeded(counter);
    
    counter.successCount += 1;
    await writeCounter(counter);

    return NextResponse.json({ success: true, count: counter.successCount });
  } catch (error) {
    console.error('Error updating success count:', error);
    return NextResponse.json({ error: 'Error updating success count' }, { status: 500 });
  }
} 