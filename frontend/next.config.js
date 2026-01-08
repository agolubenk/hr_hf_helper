/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Исправление проблем с путями статических файлов
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Убеждаемся, что статические файлы правильно обслуживаются
  trailingSlash: false,
}

module.exports = nextConfig
