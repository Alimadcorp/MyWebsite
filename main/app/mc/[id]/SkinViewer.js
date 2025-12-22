"use client";

import { useEffect, useRef } from "react";
import { SkinViewer } from "skinview3d";

export default function Skin3D({ skinUrl, capeUrl, timestamp }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const viewerRef = useRef(null);

  const target = useRef({ x: -0.35, y: 0.6 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const resize = () => {
      if (!wrapperRef.current || !viewerRef.current) return;
      const w = wrapperRef.current.clientWidth;
      const h = window.innerHeight * 0.78;
      viewerRef.current.setSize(w, h);
    };

    const viewer = new SkinViewer({
      canvas: canvasRef.current,
      skin: skinUrl,
      cape: capeUrl,
      background: null
    });

    viewer.zoom = 0.85;
    viewer.camera.rotation.x = target.current.x;
    viewer.camera.rotation.y = target.current.y;

    viewerRef.current = viewer;
    resize();
    window.addEventListener("resize", resize);

    const lerp = () => {
      if (!viewerRef.current) return;

      const cam = viewerRef.current.camera.rotation;
      cam.x += (target.current.x - cam.x) * 0.12;
      cam.y += (target.current.y - cam.y) * 0.12;

      requestAnimationFrame(lerp);
    };

    lerp();

    return () => {
      window.removeEventListener("resize", resize);
      viewer.dispose();
    };
  }, [skinUrl, capeUrl]);

  const onDown = (e) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  };

  const onMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;

    target.current.y += dx * 0.005;
    target.current.x += dy * 0.005;

    target.current.x = Math.max(-1.2, Math.min(0.3, target.current.x));

    last.current = { x: e.clientX, y: e.clientY };
  };

  const onUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full bg-zinc-900 rounded-2xl overflow-hidden touch-none"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      <canvas ref={canvasRef} className="block w-full" />

      {(false && timestamp) && (
        <div className="absolute top-3 left-3 text-xs bg-black/40 backdrop-blur px-3 py-1 rounded-full">
          {new Date(timestamp).toDateString().replace(" ", ", ")}
        </div>
      )}

      <div className="absolute bottom-3 right-3 flex gap-2">
        <a
          href={skinUrl}
          download
          className="bg-black/60 hover:bg-black backdrop-blur px-3 py-2 rounded-lg text-sm"
        >
          Skin
        </a>
        {capeUrl && (
          <a
            href={capeUrl}
            download
            className="bg-black/60 hover:bg-black backdrop-blur px-3 py-2 rounded-lg text-sm"
          >
            Cape
          </a>
        )}
      </div>
    </div>
  );
}
