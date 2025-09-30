/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    // Server Actions artık varsayılan olarak aktif
  },
  async rewrites() {
    const defaultOrigin = 'http://localhost:3001';
    const envOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || '';
    const isValidOrigin = /^https?:\/\//.test(envOrigin);
    const apiOrigin = isValidOrigin ? envOrigin : defaultOrigin;

    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
        basePath: false,
      },
    ];
  },
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

module.exports = nextConfig;
