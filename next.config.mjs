/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Fix for mongoose top-level await issues in some environments, though usually fine.
  experimental: {
    // Any experimental features if needed
  },
};

export default nextConfig;
