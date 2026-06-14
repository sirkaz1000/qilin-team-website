'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

export default function AdminFAQsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [faqs, setFaqs] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState(null)
  const [formData, setFormData] = useState({
    questionAr: '',
    questionEn: '',
    answerAr: '',
    answerEn: '',
    type: 'general',
    order: 0
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/')
    }
    if (isAdmin) {
      fetchFAQs()
    }
  }, [isAdmin, loading, router])

  const fetchFAQs = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/faq', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setFaqs(data)
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    }
  }

  const handleCreate = () => {
    setEditingFAQ(null)
    setFormData({
      questionAr: '',
      questionEn: '',
      answerAr: '',
      answerEn: '',
      type: 'general',
      order: 0
    })
    setShowModal(true)
  }

  const handleEdit = (faq) => {
    setEditingFAQ(faq)
    setFormData({
      questionAr: faq.questionAr || '',
      questionEn: faq.questionEn || '',
      answerAr: faq.answerAr || '',
      answerEn: faq.answerEn || '',
      type: faq.type || 'general',
      order: faq.order || 0
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/faq?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchFAQs()
      } else {
        alert('Failed to delete FAQ')
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      alert('Failed to delete FAQ')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      const url = editingFAQ ? '/api/faq' : '/api/faq'
      const method = editingFAQ ? 'PUT' : 'POST'

      const body = editingFAQ
        ? { ...formData, id: editingFAQ.id }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setShowModal(false)
        fetchFAQs()
      } else {
        alert('Failed to save FAQ')
      }
    } catch (error) {
      console.error('Error saving FAQ:', error)
      alert('Failed to save FAQ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">{t('loading')}</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-qilin-blue mb-2">Manage FAQs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage frequently asked questions
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add FAQ</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Question (AR)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Question (EN)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {faqs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No FAQs found. Click "Add FAQ" to create one.
                </td>
              </tr>
            ) : (
              faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      faq.type === 'auth'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {faq.type === 'auth' ? 'Auth' : 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {faq.questionAr}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {faq.questionEn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {faq.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="text-qilin-blue hover:text-qilin-dark mr-3"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-qilin-blue">
                {editingFAQ ? 'Edit FAQ' : 'Add FAQ'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="general">General (Inside Site)</option>
                  <option value="auth">Auth (Login/Register)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question (Arabic)
                </label>
                <input
                  type="text"
                  required
                  value={formData.questionAr}
                  onChange={(e) => setFormData({ ...formData, questionAr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question (English)
                </label>
                <input
                  type="text"
                  required
                  value={formData.questionEn}
                  onChange={(e) => setFormData({ ...formData, questionEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Answer (Arabic)
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.answerAr}
                  onChange={(e) => setFormData({ ...formData, answerAr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Answer (English)
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.answerEn}
                  onChange={(e) => setFormData({ ...formData, answerEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <span className="mr-2">{t('loading')}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
