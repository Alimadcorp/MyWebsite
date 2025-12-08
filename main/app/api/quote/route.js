import { NextResponse } from "next/server";

const KVDB_BUCKET = process.env.KVDB_BUCKET+"/quote";

export async function GET() {
  try {
    const res = await fetch(KVDB_BUCKET, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      quote: "404 Quote Not Found",
      writer: "That 404 guy",
      date: new Date().toISOString(),
    });
  }
}
