'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { Shield, CheckCircle } from 'lucide-react'

export default function AdminTeamPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [admins, setAdmins] = useState([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchAdmins()
    }
  }, [user])

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/admins')
      if (response.ok) {
        const data = await response.json()
        setAdmins(data)
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">{t('loading')}</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-qilin-blue flex items-center">
          <Shield className="w-8 h-8 mr-2" />
          {t('adminTeam')}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('adminAccounts')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{t('adminAccountsDesc')}</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {admins.map((admin) => (
            <div key={admin.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 flex items-center space-x-4">
              {admin.avatarUrl ? (
                <img 
                  src={admin.avatarUrl} 
                  alt={admin.displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-qilin-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {admin.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {admin.displayName}
                  </h3>
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">@{admin.username}</p>
              </div>
            </div>
          ))}
        </div>

        {admins.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{t('noAdmins')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
