import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'Unknown';
  let { payload, status } = await req.json();
  payload = { ...payload, ip };
  const encoded = encodeURIComponent(JSON.stringify(payload));
  const url = `https://log.alimad.co/api/log?channel=mail-alimad-co&text=${encoded}` + (status ? `&status=${status}&ip=${ip}` : '');
  try {
    await fetch(url);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
