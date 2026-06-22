const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd18f57oyxifcsh.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // AWS Amplify expects the Next.js build output in `.next`
  distDir: '.next',
};

export default nextConfig;
