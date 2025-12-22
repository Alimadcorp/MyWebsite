import Skin3D from "./SkinViewer";

async function getData(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/mc/${id}`, {
    cache: "force-cache",
  });
  if (!res.ok) return { error: "404 Not found" };
  return res.json();
}

export default async function Page({ params }) {
  let x = (await params).id;
  const data = await getData(x);
  if (data.error) {
    return (
      <div className="h-screen bg-black text-white font-mono flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-6xl font-bold text-red-500">!</h1>
          <h2 className="text-2xl font-bold tracking-tight">{data.error}</h2>
          <p className="text-white/40 text-sm">
            We couldn't find the player or there was an issue with the Mojang API.
          </p>
        </div>
      </div>
    );
  }
  const tex = data.textures?.textures || {};

  return (
    <div className="h-screen bg-black text-white font-mono flex items-center">
      <div className="w-full max-w-5xl mx-auto px-4 space-y-2">
        <div className="text-center max-h-[vh-20]">
          <h1 className="text-4xl font-bold">{data.name}</h1>
          <p className="text-white/50 text-sm truncate">{data.id}</p>
        </div>

        {tex.SKIN && (
          <Skin3D
            skinUrl={tex.SKIN.url}
            capeUrl={tex.CAPE?.url}
            timestamp={data.textures?.timestamp}
          />
        )}
      </div>
    </div>
  );
}