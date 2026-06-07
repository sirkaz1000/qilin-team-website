'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

export default function LayoutContent({ children }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isFAQPage = pathname === '/faq'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!isAuthPage && !isFAQPage && <Navbar />}
      <main className={!isAuthPage && !isFAQPage ? 'pt-16' : ''}>
        {children}
      </main>
    </div>
  )
}
