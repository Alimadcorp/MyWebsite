import Skin3D from "./SkinViewer";
import Link from "next/link";

async function getData(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mc/${id}`, {
      cache: "force-cache",
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.error || "Failed to fetch data" };
    }
    return res.json();
  } catch (e) {
    return { error: "Network error or invalid ID" };
  }
}

export default async function Page({ params }) {
  const { id } = await params;
  const data = await getData(id);

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
  const hasSkin = !!tex.SKIN;

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              {data.name}
            </h1>
            <p className="text-white/30 text-sm md:text-base break-all uppercase tracking-widest">
              UUID: {data.id}
            </p>
          </div>
          <Link
            href="/mc"
            className="text-white/50 hover:text-white text-sm border-b border-white/20 pb-1 flex items-center gap-2 transition-all"
          >
            ← SEARCH ANOTHER
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main View: Skin Renderer */}
          <div className="lg:col-span-2 aspect-[4/5] md:aspect-auto">
            {hasSkin ? (
              <Skin3D
                skinUrl={tex.SKIN.url}
                capeUrl={tex.CAPE?.url}
                timestamp={data.textures?.timestamp}
              />
            ) : (
              <div className="w-full h-full min-h-[500px] bg-zinc-900 rounded-3xl flex items-center justify-center border border-white/5 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="text-center space-y-2 relative">
                  <div className="text-5xl opacity-20 group-hover:scale-110 transition-transform duration-500">👤</div>
                  <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No 3D Data</p>
                  <p className="text-white/20 text-xs px-8">This player is using a default or hidden skin.</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Details View */}
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] border-l-2 border-white/20 pl-3">
                Texture Manifest
              </h3>
              <div className="bg-zinc-900/50 rounded-2xl p-4 md:p-6 border border-white/5 space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-white/30 uppercase font-black italic">Skin Type</p>
                  <p className="text-sm font-medium">{tex.SKIN?.metadata?.model === "slim" ? "Slim (Alex)" : "Classic (Steve)"}</p>
                </div>
                
                {tex.SKIN && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/30 uppercase font-black italic">Skin Source</p>
                    <a href={tex.SKIN.url} target="_blank" className="text-xs text-blue-400 hover:underline break-all block">
                      {tex.SKIN.url}
                    </a>
                  </div>
                )}

                {tex.CAPE && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/30 uppercase font-black italic">Cape Source</p>
                    <a href={tex.CAPE.url} target="_blank" className="text-xs text-blue-400 hover:underline break-all block">
                      {tex.CAPE.url}
                    </a>
                  </div>
                )}

                {!tex.SKIN && !tex.CAPE && (
                  <p className="text-xs text-white/20 italic italic-none">No active textures found</p>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] border-l-2 border-white/20 pl-3">
                Raw Metadata
              </h3>
              <div className="bg-zinc-900/50 rounded-2xl p-4 md:p-6 border border-white/5 max-h-[300px] overflow-auto custom-scrollbar">
                <pre className="text-[10px] leading-relaxed text-white/60">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </section>

            <div className="pt-4">
              <Link 
                href="/mc"
                className="block w-full py-4 border border-white/10 rounded-2xl text-[10px] text-center font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300"
              >
                Search Another Player
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
