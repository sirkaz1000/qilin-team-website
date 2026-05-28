'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { Calendar, MessageSquare, Pin } from 'lucide-react'

export default function PostsPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [posts, setPosts] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [newPost, setNewPost] = useState({ title: '', content: '' })
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Fetch posts
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setImageUrl(data.url)
        setImageFile(file)
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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setVideoUrl(data.url)
        setVideoFile(file)
      }
    } catch (error) {
      console.error('Error uploading video:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          imageUrl,
          videoUrl
        })
      })

      if (response.ok) {
        setShowCreateModal(false)
        setNewPost({ title: '', content: '' })
        setImageUrl('')
        setVideoUrl('')
        setImageFile(null)
        setVideoFile(null)
        fetchPosts()
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleEditPost = (post) => {
    setEditingPost(post)
    setNewPost({ title: post.title, content: post.content })
    setImageUrl(post.imageUrl || '')
    setVideoUrl(post.videoUrl || '')
    setShowEditModal(true)
  }

  const handleUpdatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return

    try {
      const response = await fetch(`/api/posts/${editingPost.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          imageUrl,
          videoUrl
        })
      })

      if (response.ok) {
        setShowEditModal(false)
        setEditingPost(null)
        setNewPost({ title: '', content: '' })
        setImageUrl('')
        setVideoUrl('')
        setImageFile(null)
        setVideoFile(null)
        fetchPosts()
      }
    } catch (error) {
      console.error('Error updating post:', error)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleTogglePin = async (postId, currentPinned) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          isPinned: !currentPinned
        })
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
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
        <h1 className="text-3xl font-bold text-qilin-blue">{t('posts')}</h1>
        {isAdmin && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
          >
            {t('create')} Post
          </button>
        )}
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">{t('noPostsYet')}</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {post.isPinned && (
                      <Pin className="w-4 h-4 text-qilin-blue" />
                    )}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {post.title}
                    </h2>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>{t('by')} {post.author.displayName}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTogglePin(post.id, post.isPinned)}
                      className={`px-2 py-1 text-sm rounded-lg transition-colors ${
                        post.isPinned
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      title={post.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditPost(post)}
                      className="px-2 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  <span>{post.comments?.length || 0} {t('comments')}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-qilin-blue mb-4">{t('create')} Post</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
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
                {uploading && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('loading')}</p>
                )}
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
                  onClick={handleCreatePost}
                  className="flex-1 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
                >
                  {t('create')}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewPost({ title: '', content: '' })
                    setImageUrl('')
                    setVideoUrl('')
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

      {/* Edit Post Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-qilin-blue mb-4">Edit Post</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
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
                {uploading && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('loading')}</p>
                )}
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
                  onClick={handleUpdatePost}
                  className="flex-1 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingPost(null)
                    setNewPost({ title: '', content: '' })
                    setImageUrl('')
                    setVideoUrl('')
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
