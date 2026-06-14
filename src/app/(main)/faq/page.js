'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'

export default function FAQPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t, language } = useLanguage()
  const [faqs, setFaqs] = useState([])
  const [openIndex, setOpenIndex] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [supportForm, setSupportForm] = useState({ subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/faq?type=general')
      if (response.ok) {
        const data = await response.json()
        setFaqs(data)
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    }
  }

  const filteredFAQs = faqs.filter(faq => {
    const question = language === 'ar' ? faq.questionAr : faq.questionEn
    const answer = language === 'ar' ? faq.answerAr : faq.answerEn
    const query = searchQuery.toLowerCase()
    return question.toLowerCase().includes(query) || answer.toLowerCase().includes(query)
  })

  const handleSubmitSupport = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage({ type: '', text: '' })

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(supportForm),
      })

      if (response.ok) {
        setSupportForm({ subject: '', message: '' })
        setSubmitMessage({ type: 'success', text: 'Ticket submitted successfully!' })
        // Create notification for admin only if user is logged in
        if (user && token) {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              type: 'SUPPORT_TICKET',
              title: 'New Support Ticket',
              message: `${user.displayName} (@${user.username}) submitted a new support ticket`,
              targetUserId: null, // For all admins
            }),
          })
        }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-qilin-blue mb-4 flex items-center justify-center">
          <HelpCircle className="w-8 h-8 mr-2" />
          {t('faq')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('findAnswers')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder={t('searchQuestions')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">{t('noFAQsFound')}</p>
          </div>
        ) : (
          filteredFAQs.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-5 h-5 text-qilin-blue flex-shrink-0" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {language === 'ar' ? faq.questionAr : faq.questionEn}
                  </span>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 pt-2">
                  <p className="text-gray-600 dark:text-gray-400 ml-8">
                    {language === 'ar' ? faq.answerAr : faq.answerEn}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Contact Support */}
      <div className="mt-12 bg-gradient-to-r from-qilin-blue to-qilin-light rounded-xl p-8 text-white text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">{t('stillHaveQuestions')}</h3>
        <p className="mb-4 opacity-90">
          {t('cantFindAnswer')}
        </p>
        <button
          onClick={() => setShowSupportModal(true)}
          className="px-6 py-3 bg-white text-qilin-blue rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          {t('contactSupport')}
        </button>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-qilin-blue mb-4">{t('contactSupport')}</h3>
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
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-qilin-blue text-white rounded-lg hover:bg-qilin-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t('loading') : t('send')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSupportModal(false)
                    setSupportForm({ subject: '', message: '' })
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
