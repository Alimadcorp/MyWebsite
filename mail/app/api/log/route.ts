import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { payload, status } = await req.json();
  const encoded = encodeURIComponent(JSON.stringify(payload));

  await fetch(`https://log.alimad.co/api/log?channel=mail-alimad-co-read-2&text=${encoded}&status=${status}`, {
    method: 'GET',
  });

  return NextResponse.json({ ok: true });
}
