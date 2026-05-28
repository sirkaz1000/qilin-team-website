'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { LifeBuoy, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function SupportPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [tickets, setTickets] = useState([])
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/support', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage({ type: '', text: '' })

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ subject: '', message: '' })
        setSubmitMessage({ type: 'success', text: 'Ticket submitted successfully!' })
        fetchTickets()
      } else {
        const errorData = await response.json()
        setSubmitMessage({ type: 'error', text: errorData.error || 'Failed to submit ticket' })
      }
    } catch (error) {
      console.error('Error submitting ticket:', error)
      setSubmitMessage({ type: 'error', text: 'Failed to submit ticket. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'RESOLVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'CLOSED':
        return <CheckCircle className="w-5 h-5 text-gray-500" />
      default:
        return null
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
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Create Ticket Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-qilin-blue mb-6 flex items-center">
            <LifeBuoy className="w-6 h-6 mr-2" />
            Create Support Ticket
          </h2>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Brief description of your issue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder="Describe your issue in detail"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-4 py-3 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                t('loading')
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Ticket
                </>
              )}
            </button>
          </form>
        </div>

        {/* My Tickets */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-qilin-blue mb-6">My Tickets</h2>
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No support tickets yet
              </p>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {ticket.subject}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(ticket.status)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {ticket.message.substring(0, 100)}...
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
