'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { Trophy, Calendar, Star } from 'lucide-react'

export default function AchievementsPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [achievements, setAchievements] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState(null)
  const [newAchievement, setNewAchievement] = useState({ title: '', description: '' })
  const [iconUrl, setIconUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [iconFile, setIconFile] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements')
      if (response.ok) {
        const data = await response.json()
        setAchievements(data)
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }

  const handleIconUpload = async (e) => {
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
        setIconUrl(data.url)
        setIconFile(file)
      } else {
        const errorData = await response.json()
        console.error('Upload error:', errorData.error)
      }
    } catch (error) {
      console.error('Error uploading icon:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = async (e) => {
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
        setImageUrl(data.url)
        setImageFile(file)
      } else {
        const errorData = await response.json()
        console.error('Upload error:', errorData.error)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleVideoUpload = async (e) => {
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
        setVideoUrl(data.url)
        setVideoFile(file)
      } else {
        const errorData = await response.json()
        console.error('Upload error:', errorData.error)
      }
    } catch (error) {
      console.error('Error uploading video:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleCreateAchievement = async () => {
    if (!newAchievement.title.trim() || !newAchievement.description.trim()) return

    try {
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: newAchievement.title,
          description: newAchievement.description,
          iconUrl,
          imageUrl,
          videoUrl
        })
      })

      if (response.ok) {
        setShowCreateModal(false)
        setNewAchievement({ title: '', description: '' })
        setIconUrl('')
        setImageUrl('')
        setVideoUrl('')
        setIconFile(null)
        setImageFile(null)
        setVideoFile(null)
        fetchAchievements()
      }
    } catch (error) {
      console.error('Error creating achievement:', error)
    }
  }

  const handleEditAchievement = (achievement) => {
    setEditingAchievement(achievement)
    setNewAchievement({ title: achievement.title, description: achievement.description })
    setIconUrl(achievement.iconUrl || '')
    setImageUrl(achievement.imageUrl || '')
    setVideoUrl(achievement.videoUrl || '')
    setShowEditModal(true)
  }

  const handleUpdateAchievement = async () => {
    if (!newAchievement.title.trim() || !newAchievement.description.trim()) return

    try {
      const response = await fetch(`/api/achievements/${editingAchievement.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: newAchievement.title,
          description: newAchievement.description,
          iconUrl,
          imageUrl,
          videoUrl
        })
      })

      if (response.ok) {
        setShowEditModal(false)
        setEditingAchievement(null)
        setNewAchievement({ title: '', description: '' })
        setIconUrl('')
        setImageUrl('')
        setVideoUrl('')
        setIconFile(null)
        setImageFile(null)
        setVideoFile(null)
        fetchAchievements()
      }
    } catch (error) {
      console.error('Error updating achievement:', error)
    }
  }

  const handleDeleteAchievement = async (achievementId) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return

    try {
      const response = await fetch(`/api/achievements/${achievementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        fetchAchievements()
      }
    } catch (error) {
      console.error('Error deleting achievement:', error)
    }
  }

  const handleToggleFeatured = async (achievementId, currentFeatured) => {
    try {
      const response = await fetch(`/api/achievements/${achievementId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          isFeatured: !currentFeatured
        })
      })

      if (response.ok) {
        fetchAchievements()
      }
    } catch (error) {
      console.error('Error toggling featured:', error)
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-qilin-blue">{t('achievements')}</h1>
        {isAdmin && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
          >
            {t('create')} Achievement
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">{t('noAchievementsYet')}</p>
          </div>
        ) : (
          achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-center mb-4">
                {achievement.iconUrl ? (
                  <img
                    src={achievement.iconUrl}
                    alt={achievement.title}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center mb-2">
                {achievement.isFeatured && (
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                )}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">
                  {achievement.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center">
                {achievement.description}
              </p>
              <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{new Date(achievement.createdAt).toLocaleDateString()}</span>
              </div>
              {isAdmin && (
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleToggleFeatured(achievement.id, achievement.isFeatured)}
                    className={`px-2 py-1 text-sm rounded-lg transition-colors ${
                      achievement.isFeatured
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    title={achievement.isFeatured ? 'Unfeature' : 'Feature'}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditAchievement(achievement)}
                    className="px-2 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAchievement(achievement.id)}
                    className="px-2 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Achievement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-qilin-blue mb-4">{t('create')} Achievement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                    id="icon-upload"
                  />
                  <label
                    htmlFor="icon-upload"
                    className="w-full px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors cursor-pointer text-center block"
                  >
                    {iconFile ? iconFile.name : 'Choose Icon'}
                  </label>
                </div>
                {uploading && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('loading')}</p>
                )}
                {iconFile && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    {t('success')}: {iconFile.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="w-full px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors cursor-pointer text-center block"
                  >
                    {imageFile ? imageFile.name : 'Choose Image'}
                  </label>
                </div>
                {imageFile && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    {t('success')}: {imageFile.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="w-full px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors cursor-pointer text-center block"
                  >
                    {videoFile ? videoFile.name : 'Choose Video'}
                  </label>
                </div>
                {videoFile && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    {t('success')}: {videoFile.name}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateAchievement}
                  className="flex-1 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
                >
                  {t('create')}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewAchievement({ title: '', description: '' })
                    setIconUrl('')
                    setImageUrl('')
                    setVideoUrl('')
                    setIconFile(null)
                    setImageFile(null)
                    setVideoFile(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Achievement Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-qilin-blue mb-4">Edit Achievement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                    id="icon-upload-edit"
                  />
                  <label
                    htmlFor="icon-upload-edit"
                    className="w-full px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors cursor-pointer text-center block"
                  >
                    {iconFile ? iconFile.name : (iconUrl ? 'Change Icon' : 'Choose Icon')}
                  </label>
                </div>
                {uploading && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('loading')}</p>
                )}
                {iconFile && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    {t('success')}: {iconFile.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-edit"
                  />
                  <label
                    htmlFor="image-upload-edit"
                    className="w-full px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors cursor-pointer text-center block"
                  >
                    {imageFile ? imageFile.name : (imageUrl ? 'Change Image' : 'Choose Image')}
                  </label>
                </div>
                {imageFile && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    {t('success')}: {imageFile.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload-edit"
                  />
                  <label
                    htmlFor="video-upload-edit"
                    className="w-full px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors cursor-pointer text-center block"
                  >
                    {videoFile ? videoFile.name : (videoUrl ? 'Change Video' : 'Choose Video')}
                  </label>
                </div>
                {videoFile && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    {t('success')}: {videoFile.name}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdateAchievement}
                  className="flex-1 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingAchievement(null)
                    setNewAchievement({ title: '', description: '' })
                    setIconUrl('')
                    setImageUrl('')
                    setVideoUrl('')
                    setIconFile(null)
                    setImageFile(null)
                    setVideoFile(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
