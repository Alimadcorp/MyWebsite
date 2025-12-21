async function getData(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/mc/${id}`, {
    cache: "force-cache",
  });
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export default async function Page({ params }) {
  let x = (await params).id;
  const data = await getData(x);
  const tex = data.textures?.textures || {};

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">{data.name}</h1>
        <p className="text-white/60 break-all">UUID: {data.id}</p>

        <div className="grid sm:grid-cols-2 gap-6">
          {tex.SKIN && (
            <div className="bg-zinc-900 p-4 rounded-xl">
              <h2 className="text-xl mb-2">Skin</h2>
              <img src={tex.SKIN.url} width={256} height={256} alt="Skin"  style={{ imageRendering: "pixelated" }}/>
              <p className="text-sm mt-2">
                Model: {tex.SKIN.metadata?.model || "classic"}
              </p>
            </div>
          )}

          {tex.CAPE && (
            <div className="bg-zinc-900 p-4 rounded-xl">
              <h2 className="text-xl mb-2">Cape</h2>
              <img src={tex.CAPE.url} width={256} height={256} alt="Cape"  style={{ imageRendering: "pixelated" }}/>
            </div>
          )}
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <h2 className="text-xl mb-2">Raw Texture Data</h2>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(data.textures, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
{/* -41 36 */}
