import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://textures.minecraft.net/texture/**')],
  },
};

export default nextConfig;
