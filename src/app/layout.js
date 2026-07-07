import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import Navbar from '@/components/layout/Navbar'
import LayoutContent from '@/app/LayoutContent'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Team Qilin - فريق البرمجة والتطوير',
  description: 'فريق ناشيء في مجال البرمجة و التطوير في السوشيال ميديا نسعي لرضي عملائنا بكل السبل. Team Qilin - Programming, Development & Social Media',
  keywords: ['Team Qilin', 'برمجة', 'تطوير', 'سوشيال ميديا', 'programming', 'development', 'social media', 'qilin', 'web development', 'mobile development', 'UI/UX design'],
  authors: [{ name: 'Team Qilin' }],
  creator: 'Team Qilin',
  publisher: 'Team Qilin',
  metadataBase: new URL('https://qilin-team-website.vercel.app'),
  openGraph: {
    title: 'Team Qilin - فريق البرمجة والتطوير',
    description: 'فريق ناشيء في مجال البرمجة و التطوير في السوشيال ميديا نسعي لرضي عملائنا بكل السبل',
    url: 'https://qilin-team-website.vercel.app',
    siteName: 'Team Qilin',
    locale: 'ar',
    alternateLocale: ['en'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Team Qilin - فريق البرمجة والتطوير',
    description: 'فريق ناشيء في مجال البرمجة و التطوير في السوشيال ميديا نسعي لرضي عملائنا بكل السبل',
    creator: '@TeamQilin',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <LayoutContent>
                {children}
              </LayoutContent>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
