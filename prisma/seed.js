const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@qilinteam.com',
      passwordHash: hashedPassword,
      displayName: 'Admin',
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('Admin user created:', admin)

  // Create site settings
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      siteName: 'The Qilin Team',
      siteDescription: 'Programming, Development & Social Media',
    },
  })

  console.log('Site settings created:', settings)

  // Create sample FAQ
  const faq1 = await prisma.fAQ.create({
    data: {
      questionAr: 'كيف يمكنني إنشاء حساب جديد؟',
      questionEn: 'How can I create a new account?',
      answerAr: 'يمكنك إنشاء حساب جديد من خلال صفحة التسجيل. أدخل بريدك الإلكتروني وكلمة المرور واسم المستخدم، ثم اضغط على إنشاء الحساب.',
      answerEn: 'You can create a new account through the registration page. Enter your email, password, and username, then click create account.',
      order: 1,
    },
  })

  const faq2 = await prisma.fAQ.create({
    data: {
      questionAr: 'كيف يمكنني الاتصال بالدعم الفني؟',
      questionEn: 'How can I contact technical support?',
      answerAr: 'يمكنك الاتصال بالدعم الفني من خلال زر الدعم الفني الموجود في صفحة تسجيل الدخول أو من خلال إرسال تذكرة دعم.',
      answerEn: 'You can contact technical support through the support button on the login page or by submitting a support ticket.',
      order: 2,
    },
  })

  console.log('Sample FAQs created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
