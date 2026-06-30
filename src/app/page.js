'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { Settings, MessageSquare, Trophy, Calendar } from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [showSettings, setShowSettings] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [pinnedPosts, setPinnedPosts] = useState([])
  const [featuredAchievements, setFeaturedAchievements] = useState([])
  const [settingsData, setSettingsData] = useState({
    displayName: '',
    username: '',
  })
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchComments()
      fetchPinnedPosts()
      fetchFeaturedAchievements()
      setSettingsData({
        displayName: user.displayName,
        username: user.username,
      })
    }
  }, [user])

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/comments?targetType=HOMEPAGE&targetId=homepage')
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const fetchPinnedPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPinnedPosts(data.filter(post => post.isPinned))
      }
    } catch (error) {
      console.error('Error fetching pinned posts:', error)
    }
  }

  const fetchFeaturedAchievements = async () => {
    try {
      const response = await fetch('/api/achievements')
      if (response.ok) {
        const data = await response.json()
        setFeaturedAchievements(data.filter(achievement => achievement.isFeatured))
      }
    } catch (error) {
      console.error('Error fetching featured achievements:', error)
    }
  }

  const handlePostComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newComment,
          targetType: 'HOMEPAGE',
          targetId: 'homepage'
        })
      })
      if (response.ok) {
        setNewComment('')
        fetchComments()
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    }
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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setAvatarFile(file)
        setSettingsData({
          ...settingsData,
          avatarUrl: data.url
        })
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/update-user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          displayName: settingsData.displayName,
          username: settingsData.username,
          avatarUrl: settingsData.avatarUrl,
        })
      })

      if (response.ok) {
        setShowSettings(false)
        window.location.reload()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      alert('Failed to update settings')
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-qilin-blue to-qilin-light rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-4">{t('teamName')}</h1>
        <p className="text-xl mb-2">{t('teamDescription')}</p>
        <p className="text-lg opacity-90">
          {t('welcome')}, {user.displayName}!
        </p>
      </div>

      {/* Team Founder */}
      <div className="bg-gradient-to-r from-qilin-blue to-qilin-light rounded-xl p-6 shadow-lg mb-8 text-white">
        <h2 className="text-2xl font-bold mb-4">{t('teamFounder')}</h2>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center space-x-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-qilin-blue font-bold text-xl">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h4 className="font-bold text-lg">{user.displayName}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Posts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-qilin-blue mb-4 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" />
          {t('pinnedPosts')}
        </h2>
        <div className="space-y-4">
          {pinnedPosts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('noPinnedPostsYet')}</p>
          ) : (
            pinnedPosts.map((post) => (
              <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{post.content}</p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Featured Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-qilin-blue mb-4 flex items-center">
          <Trophy className="w-6 h-6 mr-2" />
          {t('featuredAchievements')}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {featuredAchievements.length === 0 ? (
            <p className="col-span-full text-gray-500 dark:text-gray-400 text-center py-4">{t('noFeaturedAchievementsYet')}</p>
          ) : (
            featuredAchievements.map((achievement) => (
              <div key={achievement.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center mb-2">
                  {achievement.iconUrl ? (
                    <img src={achievement.iconUrl} alt={achievement.title} className="w-10 h-10 rounded-full mr-3 object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <h3 className="font-semibold">{achievement.title}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {achievement.description}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-qilin-blue mb-4 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" />
          {t('comments')}
        </h2>
        <div className="space-y-4 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-qilin-blue rounded-full flex items-center justify-center mr-2">
                  <span className="text-white font-medium text-sm">
                    {comment.user?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-sm">{comment.user?.displayName || 'Unknown'}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">@{comment.user?.username || 'unknown'}</span>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('writeComment')}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button 
            onClick={handlePostComment}
            className="px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
          >
            {t('post')}
          </button>
        </div>
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="fixed bottom-4 right-4 p-4 bg-qilin-blue text-white rounded-full shadow-lg hover:bg-qilin-dark transition-colors"
        title={t('settings')}
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-qilin-blue mb-4">{t('settings')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('displayName')}
                </label>
                <input
                  type="text"
                  value={settingsData.displayName}
                  onChange={(e) => setSettingsData({ ...settingsData, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('username')}
                </label>
                <input
                  type="text"
                  value={settingsData.username}
                  onChange={(e) => setSettingsData({ ...settingsData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('avatar')}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
                  >
                    {t('chooseFile')}
                  </button>
                  {avatarFile && (
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {avatarFile.name}
                    </span>
                  )}
                </div>
                {uploading && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('loading')}</p>
                )}
                {avatarFile && !uploading && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    {t('success')}: {avatarFile.name}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button onClick={handleSaveSettings} className="flex-1 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors">
                  {t('save')}
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copyright Footer */}
      <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p className="font-semibold text-gray-800 dark:text-gray-300 mb-4">{t('copyright')}</p>
        <p className="mb-2">{t('allRightsReserved')}</p>
        <p className="mb-2">{t('copyrightText')}</p>
        <p className="mb-2">{t('copyrightProhibition')}</p>
        <p>{t('copyrightLegal')}</p>
      </div>
    </div>
  )
}
