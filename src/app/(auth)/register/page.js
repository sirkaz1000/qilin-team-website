'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { HelpCircle } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    username: '',
    avatarUrl: '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { register } = useAuth()
  const { t } = useLanguage()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({
          ...formData,
          avatarUrl: data.url
        })
        setAvatarFile(file)
      } else {
        const errorData = await response.json()
        console.error('Upload error:', errorData.error)
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    setLoading(true)

    try {
      await register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        username: formData.username,
        avatarUrl: formData.avatarUrl || null,
      })
      router.push('/')
    } catch (err) {
      // Translate error codes
      const errorMap = {
        requiredFields: t('requiredFields'),
        invalidEmail: t('invalidEmail'),
        userAlreadyExists: t('userAlreadyExists'),
        registrationFailed: t('registrationFailed'),
      }
      setError(errorMap[err.message] || err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-silver-100 to-silver-300 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-qilin-blue">{t('register')}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('welcome')} {t('register')}
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue focus:border-transparent bg-white dark:bg-gray-700"
              placeholder={t('email')}
            />
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('displayName')}
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue focus:border-transparent bg-white dark:bg-gray-700"
              placeholder={t('displayName')}
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('username')}
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue focus:border-transparent bg-white dark:bg-gray-700"
              placeholder={t('password')}
            />
          </div>

          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('avatar')} ({t('skip')})
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue focus:border-transparent bg-white dark:bg-gray-700"
            />
            {uploading && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('loading')}</p>
            )}
            {avatarFile && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                {t('success')}: {avatarFile.name}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-qilin-blue hover:bg-qilin-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-qilin-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('loading') : t('register')}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-qilin-blue hover:text-qilin-dark transition-colors"
            >
              {t('login')}
            </Link>
          </div>

          <div className="text-center mt-2">
            <Link
              href="/faq-auth"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-qilin-blue transition-colors flex items-center justify-center"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              {t('faq')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
