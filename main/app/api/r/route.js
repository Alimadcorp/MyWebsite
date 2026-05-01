import { redirect } from 'next/navigation';
import { headers as getHeaders } from 'next/headers';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('u') || searchParams.get('url');
  if (!targetUrl) {
    return new Response('Missing URL', { status: 400 });
  }
  const headersList = await getHeaders();
  const userAgent = headersList.get('user-agent') || 'unknown';
  const referer = headersList.get('referer') || 'direct';
  const host = headersList.get('host') || 'unknown';
  const forwarded = headersList.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
  const logPayload = {
    url: targetUrl,
    client: userAgent,
    referer,
    host,
    ip
  };
  try {
    const logUrl = `https://log.alimad.co/api/log?channel=alimad-co-visit-2&text=${encodeURIComponent(JSON.stringify(logPayload))}`;
    await fetch(logUrl, { method: 'GET' });
  } catch (err) {
    console.error('Logging failed:', err);
  }
  redirect(targetUrl);
}