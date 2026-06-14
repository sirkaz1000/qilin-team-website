'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Globe, Sun, Moon } from 'lucide-react'

export default function FAQAuthPage() {
  const { t, language, toggleLanguage } = useLanguage()
  const [openIndex, setOpenIndex] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Auth-specific FAQs
  const authFAQs = [
    {
      id: 1,
      questionAr: 'كيف أنشئ حساب جديد؟',
      questionEn: 'How do I create a new account?',
      answerAr: 'يمكنك إنشاء حساب جديد بالضغط على زر "إنشاء حساب" في صفحة تسجيل الدخول. ستحتاج إلى إدخال اسم المستخدم، البريد الإلكتروني، كلمة المرور، والاسم المعروض.',
      answerEn: 'You can create a new account by clicking the "Register" button on the login page. You will need to enter your username, email, password, and display name.'
    },
    {
      id: 2,
      questionAr: 'كيف أسجل الدخول إلى حسابي؟',
      questionEn: 'How do I log in to my account?',
      answerAr: 'أدخل اسم المستخدم وكلمة المرور في صفحة تسجيل الدخول واضغط على زر "تسجيل الدخول". إذا نسيت كلمة المرور، يمكنك طلب إعادة تعيينها.',
      answerEn: 'Enter your username and password on the login page and click the "Login" button. If you forgot your password, you can request a password reset.'
    },
    {
      id: 3,
      questionAr: 'ماذا أفعل إذا نسيت كلمة المرور؟',
      questionEn: 'What should I do if I forgot my password?',
      answerAr: 'إذا نسيت كلمة المرور، يمكنك طلب إعادة تعيينها من خلال زر "نسيت كلمة المرور" في صفحة تسجيل الدخول. سيتم إرسال رابط إلى بريدك الإلكتروني لإعادة تعيين كلمة المرور.',
      answerEn: 'If you forgot your password, you can request a password reset through the "Forgot Password" button on the login page. A link will be sent to your email to reset your password.'
    },
    {
      id: 4,
      questionAr: 'ما هي متطلبات كلمة المرور؟',
      questionEn: 'What are the password requirements?',
      answerAr: 'يجب أن تكون كلمة المرور قوية وآمنة. يُنصح باستخدام مزيج من الأحرف الكبيرة والصغيرة والأرقام والرموز الخاصة.',
      answerEn: 'The password must be strong and secure. It is recommended to use a mix of uppercase and lowercase letters, numbers, and special characters.'
    },
    {
      id: 5,
      questionAr: 'هل يمكنني تغيير اسم المستخدم؟',
      questionEn: 'Can I change my username?',
      answerAr: 'اسم المستخدم فريد ولا يمكن تغييره بعد إنشاء الحساب. إذا كنت تريد استخدام اسم مستخدم مختلف، ستحتاج إلى إنشاء حساب جديد.',
      answerEn: 'The username is unique and cannot be changed after the account is created. If you want to use a different username, you will need to create a new account.'
    },
    {
      id: 6,
      questionAr: 'كيف يمكنني حذف حسابي؟',
      questionEn: 'How can I delete my account?',
      answerAr: 'لحذف حسابك، اتصل بالدعم الفني من خلال نموذج الدعم في صفحة الأسئلة الشائعة. سيتم معالجة طلبك في أقرب وقت ممكن.',
      answerEn: 'To delete your account, contact technical support through the support form on the FAQ page. Your request will be processed as soon as possible.'
    }
  ]

  const filteredFAQs = authFAQs.filter(faq => {
    const question = language === 'ar' ? faq.questionAr : faq.questionEn
    const answer = language === 'ar' ? faq.answerAr : faq.answerEn
    const query = searchQuery.toLowerCase()
    return question.toLowerCase().includes(query) || answer.toLowerCase().includes(query)
  })

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
        </div>
      </div>
    </div>
  )
}
