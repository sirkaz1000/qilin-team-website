'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Globe, Sun, Moon } from 'lucide-react'

export default function FAQAuthPage() {
  const { t, language, toggleLanguage } = useLanguage()
  const [faqs, setFaqs] = useState([])
  const [openIndex, setOpenIndex] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' })
  const [supportForm, setSupportForm] = useState({ subject: '', message: '' })

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/faq?type=auth')
      if (response.ok) {
        const data = await response.json()
        setFaqs(data)
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitSupport = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
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
        }),
      })

      if (response.ok) {
        setSupportForm({ subject: '', message: '' })
        setSubmitMessage({ type: 'success', text: 'Ticket submitted successfully!' })
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

  const filteredFAQs = faqs.filter(faq => {
    const question = language === 'ar' ? faq.questionAr : faq.questionEn
    const answer = language === 'ar' ? faq.answerAr : faq.answerEn
    const query = searchQuery.toLowerCase()
    return question.toLowerCase().includes(query) || answer.toLowerCase().includes(query)
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-silver-100 to-silver-300 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="text-xl text-gray-600 dark:text-gray-400">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-silver-100 to-silver-300 dark:from-gray-900 dark:to-gray-800 px-4 py-8 relative">
      {/* Top Left Controls */}
      <div className="absolute top-4 left-4 flex space-x-2">
        <button
          onClick={() => {
            const html = document.documentElement
            const isDark = html.classList.contains('dark')
            if (isDark) {
              html.classList.remove('dark')
            } else {
              html.classList.add('dark')
            }
          }}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Toggle Theme"
        >
          <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300 dark:hidden" />
          <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300 hidden dark:block" />
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

      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-qilin-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">{t('noFAQsFound')}</p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <div
                key={faq.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
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
    </div>
  )
}
