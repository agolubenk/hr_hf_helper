/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/finance', destination: '/company-settings/finance', permanent: false },
      { source: '/admin-crm', destination: '/admin', permanent: false },
      { source: '/admin-crm/:path*', destination: '/admin/:path*', permanent: false },
    ]
  },
  // Админка — на Radix UI по маршруту /admin (без прокси Django admin)
  // Исправление проблем с путями статических файлов
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Убеждаемся, что статические файлы правильно обслуживаются
  trailingSlash: false,
  // Настройки для правильной обработки статических файлов
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
  // Отключаем оптимизацию CSS для избежания проблем с предзагрузкой
  swcMinify: true,
}

module.exports = nextConfig
