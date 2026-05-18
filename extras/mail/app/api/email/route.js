import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const payload = await request.json();
    const sender = payload.data?.from || 'unknown';
    let receiver = payload.data?.to.join(",") || 'unknown';
    if(payload.data?.cc.length > 0) {
      receiver += `,${payload.data.cc.join(",")}`;
    }
    if(payload.data?.bcc.length > 0) {
      receiver += `,${payload.data.bcc.join(",")}`;
    }
    const createdAt = payload.created_at || new Date().toISOString();
    const subject = payload.data?.subject;
    const attach = payload.data?.attachments.length > 0 ? `:${payload.data.attachments.length} attachments` : '';
    const logText = encodeURIComponent(`${sender}->${receiver}:${subject}:${createdAt}${attach}`);
    const logUrl = `https://log.alimad.co/api/log?channel=mail-receiving&text=${logText}`;
    const logResponse = await fetch(logUrl);
    if (!logResponse.ok) {
      console.error('Failed to forward to logging service');
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}