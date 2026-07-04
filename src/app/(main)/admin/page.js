'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { Users, MessageSquare, ShoppingCart, LifeBuoy, BarChart3, Bell, Settings, Shield, UserPlus, UserMinus, Edit, HelpCircle } from 'lucide-react'

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalAdmins: 0,
    totalOrders: 0,
    totalTickets: 0,
  })
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)
  const [newAdminUsername, setNewAdminUsername] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (!loading && user && !isAdmin) {
      router.push('/')
    }
  }, [user, loading, isAdmin, router])

  useEffect(() => {
    if (isAdmin) {
      fetchStats()
      fetchUsers()
    }
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin && activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab, isAdmin])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched users:', data)
        // log avatar URLs for debugging
        data.forEach(u => console.log('avatarUrl:', u.id, u.avatarUrl))
        setUsers(data)
      } else {
        console.error('Failed to fetch users:', response.status)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleAddAdmin = async () => {
    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: newAdminUsername,
          email: `${newAdminUsername}@qilin.team`,
          password: 'TempPass123!',
          displayName: newAdminUsername
        })
      })
      if (response.ok) {
        setShowAddAdminModal(false)
        setNewAdminUsername('')
        fetchUsers()
        fetchStats()
      }
    } catch (error) {
      console.error('Error adding admin:', error)
    }
  }

  const handleDisableUser = async (userId) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId,
          isActive: false
        })
      })
      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error disabling user:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">{t('loading')}</div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: BarChart3 },
    { id: 'users', label: t('users'), icon: Users },
    { id: 'posts', label: t('posts'), icon: MessageSquare },
    { id: 'orders', label: t('orders'), icon: ShoppingCart },
    { id: 'tickets', label: t('tickets'), icon: LifeBuoy },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'settings', label: t('settings'), icon: Settings },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-qilin-blue flex items-center">
          <Shield className="w-8 h-8 mr-2" />
          {t('adminDashboard')}
        </h1>
      </div>

      {/* Stats Cards */}
      {activeTab === 'dashboard' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-qilin-blue" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{t('totalUsers')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newUsers}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{t('newUsers')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAdmins}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{t('totalAdmins')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{t('totalOrders')}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-qilin-blue text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('recentActivity')}</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-qilin-blue rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('newUserRegistered')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('newOrderReceived')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <LifeBuoy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('supportTicketCreated')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faqs' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage FAQs</h2>
                <button
                  onClick={() => router.push('/admin/faqs')}
                  className="flex items-center space-x-2 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Manage FAQs</span>
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create and manage frequently asked questions for login/register and general site pages.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                <HelpCircle className="w-12 h-12 text-qilin-blue mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Click &quot;Manage FAQs&quot; to create and edit frequently asked questions.
                </p>
                <button
                  onClick={() => router.push('/admin/faqs')}
                  className="px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
                >
                  Go to FAQ Management
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('userManagement')}</h2>
                <button
                  onClick={() => setShowAddAdminModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Admin</span>
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t('userManagementDesc')}</p>
              
              <div className="space-y-4">
                {users.map((userItem) => (
                  <div key={userItem.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {userItem.avatarUrl ? (
                        (() => {
                          try {
                            const avatarSrc = (typeof window !== 'undefined')
                              ? (userItem.avatarUrl.startsWith('http') ? userItem.avatarUrl : `${window.location.origin}${userItem.avatarUrl.startsWith('/') ? '' : '/'}${userItem.avatarUrl}`)
                              : userItem.avatarUrl
                            return (
                              <img
                                src={avatarSrc}
                                alt={userItem.displayName || userItem.username}
                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/avatars/default.svg' }}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )
                          } catch (e) {
                            return (
                              <div className="w-10 h-10 bg-qilin-blue rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">{(userItem.displayName || userItem.username || '').charAt(0).toUpperCase()}</span>
                              </div>
                            )
                          }
                        })()
                      ) : (
                        <div className="w-10 h-10 bg-qilin-blue rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">{(userItem.displayName || userItem.username || '').charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900 dark:text-white">{userItem.displayName || userItem.username}</p>
                          {userItem.role === 'ADMIN' && (
                            <Shield className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">@{userItem.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {userItem.role !== 'ADMIN' && userItem.isActive && (
                        <button
                          onClick={() => handleDisableUser(userItem.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                          title="Disable User"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        userItem.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {userItem.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('postManagement')}</h2>
              <p className="text-gray-600 dark:text-gray-400">{t('postManagementDesc')}</p>
              <div className="mt-4">
                <button className="px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors">
                  {t('createNewPost')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('orderManagement')}</h2>
              <p className="text-gray-600 dark:text-gray-400">{t('orderManagementDesc')}</p>
              <div className="mt-4">
                <button className="px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors">
                  {t('viewAllOrders')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('supportTickets')}</h2>
              <p className="text-gray-600 dark:text-gray-400">{t('supportTicketsDesc')}</p>
              <div className="mt-4">
                <button className="px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors">
                  {t('viewAllTickets')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('notifications')}</h2>
              <p className="text-gray-600 dark:text-gray-400">{t('siteSettingsDesc')}</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('siteSettings')}</h2>
              <p className="text-gray-600 dark:text-gray-400">{t('siteSettingsDesc')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Admin</h3>
            <input
              type="text"
              value={newAdminUsername}
              onChange={(e) => setNewAdminUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            />
            <div className="flex space-x-4">
              <button
                onClick={handleAddAdmin}
                className="flex-1 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
              >
                Add Admin
              </button>
              <button
                onClick={() => {
                  setShowAddAdminModal(false)
                  setNewAdminUsername('')
                }}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
