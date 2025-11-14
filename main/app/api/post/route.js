export async function GET(params) {
   const { searchParams } = new URL(params.url)
   const t = searchParams.get("t")
   if (!t) {
     return new Response("Missing t", { status: 400 })
   }
   console.log("logging:", t)
   await fetch(`https://log.alimad.co/api/log?channel=alimad-co-visit-2&text=${t}`);
   return new Response("Success", { status: 200 })
}