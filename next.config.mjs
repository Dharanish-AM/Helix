/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  // Fix for mongoose top-level await issues in some environments, though usually fine.
  experimental: {
    // Any experimental features if needed
  },
};

export default nextConfig;
