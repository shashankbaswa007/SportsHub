import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SportsHub Central',
    short_name: 'SportsHub',
    description: 'A dynamic college sports festival web app for CBIT.',
    start_url: '/',
    display: 'standalone',
    background_color: '#191970',
    theme_color: '#191970',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
  }
}