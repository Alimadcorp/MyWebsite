import { redirect } from 'next/navigation';
import { headers as getHeaders } from 'next/headers';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('u') || searchParams.get('url');
  if (!targetUrl) {
    return new Response('Missing URL', { status: 400 });
  }
  redirect(targetUrl);
}