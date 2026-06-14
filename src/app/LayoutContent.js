'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

export default function LayoutContent({ children }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/faq-auth'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!isAuthPage && <Navbar />}
      <main className={!isAuthPage ? 'pt-16' : ''}>
        {children}
      </main>
    </div>
  )
}
