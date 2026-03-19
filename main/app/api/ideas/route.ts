import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://log.alimad.co/api/pull?channel=plzgiveideasss', {
      cache: 'no-store',
    });

    if (!response.ok) throw new Error('Failed to fetch from log service');

    const data = await response.json();
    const lastTwoIdeas = data.logs.slice(-2).reverse();

    return NextResponse.json(lastTwoIdeas);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
  }
}