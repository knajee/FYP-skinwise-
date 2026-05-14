import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SkinWISE 2.0',
    short_name: 'SkinWISE',
    description: 'AI-powered skincare wellness tracking',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5EFE6',
    theme_color: '#F5EFE6',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
