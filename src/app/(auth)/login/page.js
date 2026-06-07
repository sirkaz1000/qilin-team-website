'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon, Globe, LifeBuoy, HelpCircle } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [supportForm, setSupportForm] = useState({ subject: '', message: '', username: '' })
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false)
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' })
  const router = useRouter()
  const { login } = useAuth()
  const { t, toggleLanguage, language } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
      router.push('/')
    } catch (err) {
      setError(err.message || t('error') || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitSupport = async (e) => {
    e.preventDefault()
    setIsSubmittingSupport(true)
    setSubmitMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: supportForm.subject,
          message: supportForm.message,
          username: supportForm.username,
        }),
      })

      if (response.ok) {
        setSupportForm({ subject: '', message: '', username: '' })
        setSubmitMessage({ type: 'success', text: 'Ticket submitted successfully!' })
      } else {
        const errorData = await response.json()
        setSubmitMessage({ type: 'error', text: errorData.error || 'Failed to submit ticket' })
      }
    } catch (error) {
      console.error('Error submitting ticket:', error)
      setSubmitMessage({ type: 'error', text: 'Failed to submit ticket. Please try again.' })
    } finally {
      setIsSubmittingSupport(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-silver-100 to-silver-300 dark:from-gray-900 dark:to-gray-800 px-4 relative">
      {/* Top Left Controls */}
      <div className="absolute top-4 left-4 flex space-x-2">
        <button
          onClick={toggleTheme}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
        </button>
        <button
          onClick={toggleLanguage}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1"
          title="Change Language"
        >
          <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{language === 'ar' ? 'EN' : 'AR'}</span>
        </button>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          {/* Team Qilin Title */}
          <div className="mb-6">
            <h1 className="text-5xl font-bold text-qilin-blue">Team Qilin</h1>
          </div>
          <h2 className="text-3xl font-bold text-qilin-blue">{t('login')}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('welcome')} {t('login')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('username')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue focus:border-transparent bg-white dark:bg-gray-700"
                placeholder={t('username')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue focus:border-transparent bg-white dark:bg-gray-700"
                placeholder={t('password')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-qilin-blue hover:bg-qilin-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-qilin-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('loading') : t('login')}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <Link
              href="/register"
              className="text-sm text-qilin-blue hover:text-qilin-dark transition-colors"
            >
              {t('register')}
            </Link>
          </div>
        </form>

        {/* Bottom Left Buttons */}
        <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
          <button
            onClick={() => setShowSupportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LifeBuoy className="w-4 h-4 text-qilin-blue" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('support')}</span>
          </button>
          <Link
            href="/faq"
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-qilin-blue" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('faq')}</span>
          </Link>
        </div>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-qilin-blue mb-4">{t('support')}</h3>
            {submitMessage.text && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  submitMessage.type === 'success'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}
              >
                {submitMessage.text}
              </div>
            )}
            <form onSubmit={handleSubmitSupport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('username')} ({t('optional')})
                </label>
                <input
                  type="text"
                  value={supportForm.username}
                  onChange={(e) => setSupportForm({ ...supportForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('username')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('subject')}
                </label>
                <input
                  type="text"
                  required
                  value={supportForm.subject}
                  onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('subject')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('message')}
                </label>
                <textarea
                  required
                  rows={4}
                  value={supportForm.message}
                  onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder={t('message')}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isSubmittingSupport}
                  className="flex-1 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingSupport ? t('loading') : t('send')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSupportModal(false)
                    setSupportForm({ subject: '', message: '', username: '' })
                    setSubmitMessage({ type: '', text: '' })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
