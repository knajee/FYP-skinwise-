import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/login', '/register', '/'],
      disallow: ['/api/', '/dashboard/', '/checkin/', '/profile/', '/ingredients/', '/settings/'],
    },
  }
}
