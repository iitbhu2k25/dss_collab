import type { NextConfig } from "next"


const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/geoserver/api/:path*',
        destination: 'http://172.24.160.1:9090/geoserver/:path*'
      },
      {
        source: '/api/:path*',
        destination: "http://172.24.160.1:7000/api/:path*"
      },
       {
        source: "/basics/:path*",
        destination: "http://172.24.160.1:9000/basics/:path*",
      },
      {
        source: "/auth/:path*",
        destination: "http://172.24.160.1:9000/auth/:path*",
      },
    ]
  },
}

export default nextConfig