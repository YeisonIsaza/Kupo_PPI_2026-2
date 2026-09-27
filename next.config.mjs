import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.69.82', 'localhost'],
  turbopack: {
    root: __dirname,
  }
};

export default nextConfig;