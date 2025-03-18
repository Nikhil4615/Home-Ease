/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'lh3.googleusercontent.com',
            'googleusercontent.com',
            'drive.google.com'
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
