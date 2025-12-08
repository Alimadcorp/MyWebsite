import { NextResponse } from "next/server";
import { quotes } from "@/data/quotes";
const KVDB_BUCKET = process.env.KVDB_BUCKET+"/quote";

export async function GET() {
  try {
    //const res = await fetch(KVDB_BUCKET, { cache: "no-store" });
    //const data = await res.json();
    let day = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % quotes.length;
    const raw = quotes[day];
    const data = {
      quote: raw.text,
      writer: `${raw.author}, ${raw.source}`,
      date: new Date().setHours(0, 0, 0, 0)
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      quote: "404 Quote Not Found",
      writer: "That 404 guy",
      date: new Date().toISOString(),
    });
  }
}
