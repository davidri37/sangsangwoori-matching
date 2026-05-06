import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Turbopack detects C:\Users\Davidri37 as workspace root due to a lockfile there,
  // making path idents include Korean characters (바탕 화면) which causes a Rust panic.
  // Pinning root to the project directory keeps all idents ASCII-safe.
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
