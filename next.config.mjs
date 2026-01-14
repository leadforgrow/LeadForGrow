/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set the project root to avoid the inferred root issue
  experimental: {
    turbopack: {
      // This tells Turbopack to only look in the current project directory
      root: '.'
    }
  }
};

export default nextConfig;
