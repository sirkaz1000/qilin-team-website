'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Sun, Moon, Globe, LogOut, Settings, Menu, X, CheckCircle } from 'lucide-react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { language, toggleLanguage, t, isRTL } = useLanguage()

  const navItems = [
    { name: t('home'), href: '/' },
    { name: t('posts'), href: '/posts' },
    { name: t('achievements'), href: '/achievements' },
    { name: t('store'), href: '/store' },
    { name: t('faq'), href: '/faq' },
    { name: t('adminTeam'), href: '/admin-team' },
  ]

  if (isAdmin) {
    navItems.push({ name: t('admin'), href: '/admin' })
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Language & Theme */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={language === 'ar' ? 'English' : 'العربية'}
            >
              <Globe className="w-5 h-5 text-qilin-blue" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-qilin-blue" />
              ) : (
                <Moon className="w-5 h-5 text-qilin-blue" />
              )}
            </button>
          </div>

          {/* Center - Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-qilin-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">Q</span>
              </div>
              <span className="text-xl font-bold text-qilin-blue hidden sm:block">
                {t('teamName')}
              </span>
            </Link>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-qilin-blue text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User menu */}
            {user && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={t('logout')}
                >
                  <LogOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <div className="relative">
                  <div className="w-8 h-8 bg-qilin-blue rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {user.role === 'ADMIN' && (
                    <CheckCircle className="w-4 h-4 text-yellow-500 absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-qilin-blue text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
