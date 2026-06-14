'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext(null)

const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    posts: 'المنشورات',
    achievements: 'الإنجازات',
    hosting: 'الاستضافة',
    store: 'المتجر',
    faq: 'الأسئلة الشائعة',
    admin: 'لوحة التحكم',
    adminTeam: 'الإدارة',
    
    // Auth
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    username: 'اسم المستخدم',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    displayName: 'الاسم المعروض',
    avatar: 'الصورة الشخصية',
    avatarUrl: 'رابط الصورة',
    skip: 'تخطي',
    optional: 'اختياري',
    chooseFile: 'اختر ملف',
    chooseAvatar: 'اختر صورة رمزية',
    
    // Buttons
    submit: 'إرسال',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    create: 'إنشاء',
    post: 'نشر',
    send: 'إرسال',
    
    // Messages
    welcome: 'مرحباً',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
    
    // Error Messages
    userAlreadyExists: 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل',
    invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    userNotFound: 'المستخدم غير موجود',
    invalidEmail: 'البريد الإلكتروني غير صحيح',
    requiredFields: 'جميع الحقول مطلوبة',
    loginFailed: 'فشل تسجيل الدخول',
    registrationFailed: 'فشل إنشاء الحساب',
    
    // Support
    support: 'الدعم الفني',
    contactSupport: 'اتصل بالدعم الفني',
    
    // Home Page
    teamName: 'فريق Qilin',
    teamDescription: 'البرمجة، التطوير ووسائل التواصل الاجتماعي',
    aboutTeam: 'عن فريقنا',
    coreMembers: 'الأعضاء الأساسيون',
    adminTeamLead: 'مدير الفريق',
    developmentTeam: 'فريق التطوير',
    designTeam: 'فريق التصميم',
    socialMediaTeam: 'فريق وسائل التواصل الاجتماعي',
    ourMission: 'مهمتنا',
    missionText: 'نحن ملتزمون بتقديم خدمات برمجية وتطويرية ووسائل تواصل اجتماعي عالية الجودة لمساعدة الشركات والأفراد على النجاح في العالم الرقمي.',
    pinnedPosts: 'المنشورات المثبتة',
    welcomePostTitle: 'مرحباً بكم في موقع فريق Qilin',
    welcomePostContent: 'نحن متحمسون لإطلاق موقعنا الجديد! ترقبوا التحديثات والإعلانات.',
    featuredAchievements: 'الإنجازات المميزة',
    projectsCompleted: 'أكثر من 100 مشروع مكتمل',
    projectsCompletedText: 'تم تسليم أكثر من 100 مشروع للعملاء حول العالم بنجاح.',
    communityGrowth: 'نمو المجتمع',
    communityGrowthText: 'بنينا مجتمعاً قوياً من المطورين والعملاء.',
    comments: 'التعليقات',
    writeComment: 'اكتب تعليقاً...',
    settings: 'الإعدادات',
    teamFounder: 'مؤسس الفريق',
    
    // Admin
    adminDashboard: 'لوحة التحكم',
    manageUsers: 'إدارة المستخدمين',
    managePosts: 'إدارة المنشورات',
    manageAchievements: 'إدارة الإنجازات',
    manageStore: 'إدارة المتجر',
    manageSupport: 'إدارة الدعم',
    statistics: 'الإحصائيات',
    dashboard: 'لوحة المعلومات',
    users: 'المستخدمين',
    orders: 'الطلبات',
    tickets: 'التذاكر',
    notifications: 'الإشعارات',
    settings: 'الإعدادات',
    totalUsers: 'إجمالي المستخدمين',
    newUsers: 'مستخدمون جدد (7 أيام)',
    totalAdmins: 'إجمالي المشرفين',
    totalOrders: 'إجمالي الطلبات',
    recentActivity: 'النشاط الأخير',
    newUserRegistered: 'تسجيل مستخدم جديد',
    newOrderReceived: 'استلام طلب جديد',
    supportTicketCreated: 'إنشاء تذكرة دعم',
    userManagement: 'إدارة المستخدمين',
    userManagementDesc: 'إدارة حسابات المستخدمين، الصلاحيات، والوصول.',
    viewAllUsers: 'عرض جميع المستخدمين',
    postManagement: 'إدارة المنشورات',
    postManagementDesc: 'إنشاء، تعديل، وإدارة منشورات الفريق والإعلانات.',
    createNewPost: 'إنشاء منشور جديد',
    orderManagement: 'إدارة الطلبات',
    orderManagementDesc: 'عرض وإدارة طلبات المتجر وطلبات الخدمات.',
    viewAllOrders: 'عرض جميع الطلبات',
    supportTickets: 'تذاكر الدعم',
    supportTicketsDesc: 'إدارة والرد على طلبات دعم المستخدمين.',
    viewAllTickets: 'عرض جميع التذاكر',
    siteSettings: 'إعدادات الموقع',
    siteSettingsDesc: 'تكوين إعدادات الموقع والتفضيلات.',
    
    // Copyright
    copyright: '© 2026 Qilin Team All Rights Reserved',
    allRightsReserved: 'جميع الحقوق محفوظة لفريق Qilin',
    copyrightText: 'جميع الأفكار والتصاميم والمشاريع والمحتوى المعروض على هذا الموقع هي ملكية حصرية لفريق Qilin ومحمية بموجب قوانين الملكية الفكرية وحقوق النشر',
    copyrightProhibition: 'يُمنع منعاً باتاً أي نسخ أو إعادة استخدام أو تعديل أو إعادة نشر أي جزء من هذا المحتوى دون الحصول على إذن كتابي مسبق من الفريق',
    copyrightLegal: 'سيتم اعتبار أي استخدام غير مصرح به انتهاكاً لحقوق الملكية الفكرية، ويحتفظ فريق Qilin بالحق الكامل في اتخاذ الإجراءات القانونية المناسبة لحماية أعماله ومحتواه',
    
    // Achievement Form
    achievement: 'إنجاز',
    title: 'العنوان',
    description: 'الوصف',
    content: 'المحتوى',
    icon: 'الأيقونة',
    image: 'الصورة',
    video: 'الفيديو',
    chooseIcon: 'اختر أيقونة',
    chooseImage: 'اختر صورة',
    chooseVideo: 'اختر فيديو',
    editAchievement: 'تعديل الإنجاز',
    createAchievement: 'إنشاء إنجاز',
    
    // Post Form
    post: 'منشور',
    createPost: 'إنشاء منشور',
    editPost: 'تعديل منشور',
    
    // Achievement Page
    noAchievementsYet: 'لا توجد إنجازات بعد',
    feature: 'تمييز',
    unfeature: 'إلغاء التمييز',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    
    // Store
    store: 'المتجر',
    services: 'الخدمات',
    products: 'المنتجات',
    price: 'السعر',
    buy: 'شراء',
    orderHistory: 'سجل الطلبات',
    all: 'الكل',
    ourServices: 'خدماتنا',
    addItem: 'إضافة عنصر',
    webDevelopment: 'تطوير الويب',
    webDevelopmentDesc: 'تطبيقات ومواقع ويب مخصصة حسب احتياجاتك.',
    uiuxDesign: 'تصميم UI/UX',
    uiuxDesignDesc: 'تصاميم جميلة وبديهية لمنتجاتك الرقمية.',
    mobileDevelopment: 'تطوير الهاتف المحمول',
    mobileDevelopmentDesc: 'تطبيقات الهاتف المحمول الأصلية والمتعددة المنصات.',
    startingAt: 'تبدأ من',
    order: 'طلب',
    digitalProducts: 'المنتجات الرقمية',
    noProductsAvailable: 'لا توجد منتجات متاحة بعد',
    purchase: 'شراء',
    request: 'طلب',
    addItem: 'إضافة عنصر',
    editItem: 'تعديل عنصر',
    title: 'العنوان',
    description: 'الوصف',
    type: 'النوع',
    service: 'خدمة',
    product: 'منتج',
    imageUrl: 'رابط الصورة',
    add: 'إضافة',
    save: 'حفظ',
    
    // Hosting
    repositories: 'المستودعات',
    createRepo: 'إنشاء مستودع',
    repoName: 'اسم المستودع',
    repoDescription: 'وصف المستودع',
    newRepository: 'مستودع جديد',
    gitHubLikeHosting: 'نظام استضافة شبيه بـ GitHub',
    gitHubLikeHostingDesc: 'إدارة مستودعات الكود الخاصة بك مع دعم Git الكامل. إنشاء، تعديل، والتعاون على المشاريع مع فريقك.',
    gitSupport: 'دعم Git',
    fullVersionControl: 'تحكم كامل في الإصدارات',
    fileManagement: 'إدارة الملفات',
    easyFileEditing: 'تعديل الملفات بسهولة',
    accessControl: 'التحكم في الوصول',
    publicAndPrivate: 'عام وخاص',
    createFirstRepo: 'إنشاء أول مستودع لك',
    updated: 'تم التحديث',
    
    // FAQ
    frequentlyAskedQuestions: 'الأسئلة الشائعة',
    search: 'بحث',
    findAnswers: 'ابحث عن إجابات للأسئلة الأكثر شيوعاً',
    searchQuestions: 'ابحث في الأسئلة...',
    noFAQsFound: 'لم يتم العثور على أسئلة شائعة',
    stillHaveQuestions: 'لا تزال لديك أسئلة؟',
    cantFindAnswer: 'لم تجد الإجابة التي تبحث عنها؟ اتصل بفريق الدعم لدينا.',
    
    // Common
    by: 'بواسطة',
    noPostsYet: 'لا توجد منشورات بعد',
    noAchievementsYet: 'لا توجد إنجازات بعد',
    noRepositoriesYet: 'لا توجد مستودعات بعد',
    noItemsYet: 'لا توجد عناصر بعد',
    noPinnedPostsYet: 'لا توجد منشورات مثبتة بعد',
    noFeaturedAchievementsYet: 'لا توجد إنجازات مميزة بعد',
    subject: 'الموضوع',
    message: 'الرسالة',
    
    // Admin Team
    adminAccounts: 'حسابات المشرفين',
    adminAccountsDesc: 'فريق المشرفين الذين يديرون الموقع',
    noAdmins: 'لا يوجد مشرفين حالياً',
  },
  en: {
    // Navigation
    home: 'Home',
    posts: 'Posts',
    achievements: 'Achievements',
    hosting: 'Hosting',
    store: 'Store',
    faq: 'FAQ',
    admin: 'Admin Dashboard',
    adminTeam: 'Admin Team',
    
    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    displayName: 'Display Name',
    avatar: 'Avatar',
    avatarUrl: 'Avatar URL',
    skip: 'Skip',
    optional: 'optional',
    chooseFile: 'Choose File',
    chooseAvatar: 'Choose Avatar',
    
    // Buttons
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    post: 'Post',
    send: 'Send',
    
    // Messages
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    
    // Error Messages
    userAlreadyExists: 'Username or email already exists',
    invalidCredentials: 'Invalid username or password',
    userNotFound: 'User not found',
    invalidEmail: 'Invalid email format',
    requiredFields: 'All fields are required',
    loginFailed: 'Login failed',
    registrationFailed: 'Registration failed',
    
    // Support
    support: 'Technical Support',
    contactSupport: 'Contact Technical Support',
    
    // Home Page
    teamName: 'The Qilin Team',
    teamDescription: 'Programming, Development & Social Media',
    aboutTeam: 'About Our Team',
    coreMembers: 'Core Members',
    adminTeamLead: 'Admin - Team Lead',
    developmentTeam: 'Development Team',
    designTeam: 'Design Team',
    socialMediaTeam: 'Social Media Team',
    ourMission: 'Our Mission',
    missionText: 'We are dedicated to providing high-quality programming, development, and social media services to help businesses and individuals succeed in the digital world.',
    pinnedPosts: 'Pinned Posts',
    welcomePostTitle: 'Welcome to The Qilin Team Website',
    welcomePostContent: 'We are excited to launch our new website! Stay tuned for updates and announcements.',
    featuredAchievements: 'Featured Achievements',
    projectsCompleted: '100+ Projects Completed',
    projectsCompletedText: 'Successfully delivered over 100 projects for clients worldwide.',
    communityGrowth: 'Community Growth',
    communityGrowthText: 'Built a strong community of developers and clients.',
    comments: 'Comments',
    writeComment: 'Write a comment...',
    settings: 'Settings',
    teamFounder: 'Team Founder',
    
    // Admin
    adminDashboard: 'Admin Dashboard',
    manageUsers: 'Manage Users',
    managePosts: 'Manage Posts',
    manageAchievements: 'Manage Achievements',
    manageStore: 'Manage Store',
    manageSupport: 'Manage Support',
    statistics: 'Statistics',
    dashboard: 'Dashboard',
    users: 'Users',
    orders: 'Orders',
    tickets: 'Tickets',
    notifications: 'Notifications',
    settings: 'Settings',
    totalUsers: 'Total Users',
    newUsers: 'New Users (7 days)',
    totalAdmins: 'Total Admins',
    totalOrders: 'Total Orders',
    recentActivity: 'Recent Activity',
    newUserRegistered: 'New user registered',
    newOrderReceived: 'New order received',
    supportTicketCreated: 'Support ticket created',
    userManagement: 'User Management',
    userManagementDesc: 'Manage user accounts, permissions, and access.',
    viewAllUsers: 'View All Users',
    postManagement: 'Post Management',
    postManagementDesc: 'Create, edit, and manage team posts and announcements.',
    createNewPost: 'Create New Post',
    orderManagement: 'Order Management',
    orderManagementDesc: 'View and manage store orders and service requests.',
    viewAllOrders: 'View All Orders',
    supportTickets: 'Support Tickets',
    supportTicketsDesc: 'Manage and respond to user support requests.',
    viewAllTickets: 'View All Tickets',
    siteSettings: 'Site Settings',
    siteSettingsDesc: 'Configure site-wide settings and preferences.',
    
    // Copyright
    copyright: '© 2026 Qilin Team All Rights Reserved',
    allRightsReserved: 'All rights reserved to Qilin Team',
    copyrightText: 'All ideas designs projects and content displayed on this website are the exclusive property of Qilin Team and are protected under intellectual property and copyright laws',
    copyrightProhibition: 'Any copying reuse modification or republication of any part of this content without prior written permission from the team is strictly prohibited',
    copyrightLegal: 'Any unauthorized use will be regarded as an infringement of intellectual property rights and Qilin Team reserves the full right to take appropriate legal action to protect its work and content',
    
    // Achievement Form
    achievement: 'Achievement',
    title: 'Title',
    description: 'Description',
    content: 'Content',
    icon: 'Icon',
    image: 'Image',
    video: 'Video',
    chooseIcon: 'Choose Icon',
    chooseImage: 'Choose Image',
    chooseVideo: 'Choose Video',
    editAchievement: 'Edit Achievement',
    createAchievement: 'Create Achievement',
    
    // Post Form
    post: 'Post',
    createPost: 'Create Post',
    editPost: 'Edit Post',
    
    // Achievement Page
    noAchievementsYet: 'No achievements yet',
    feature: 'Feature',
    unfeature: 'Unfeature',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    
    // Store
    store: 'Store',
    services: 'Services',
    products: 'Products',
    price: 'Price',
    buy: 'Buy',
    orderHistory: 'Order History',
    all: 'All',
    ourServices: 'Our Services',
    webDevelopment: 'Web Development',
    webDevelopmentDesc: 'Custom web applications and websites tailored to your needs.',
    uiuxDesign: 'UI/UX Design',
    uiuxDesignDesc: 'Beautiful and intuitive designs for your digital products.',
    mobileDevelopment: 'Mobile Development',
    mobileDevelopmentDesc: 'Native and cross-platform mobile applications.',
    startingAt: 'Starting at',
    order: 'Order',
    digitalProducts: 'Digital Products',
    noProductsAvailable: 'No products available yet',
    purchase: 'Purchase',
    request: 'Request',
    addItem: 'Add Item',
    editItem: 'Edit Item',
    title: 'Title',
    description: 'Description',
    type: 'Type',
    service: 'Service',
    product: 'Product',
    imageUrl: 'Image URL',
    add: 'Add',
    save: 'Save',
    
    // Hosting
    repositories: 'Repositories',
    createRepo: 'Create Repository',
    repoName: 'Repository Name',
    repoDescription: 'Repository Description',
    newRepository: 'New Repository',
    gitHubLikeHosting: 'GitHub-like Hosting System',
    gitHubLikeHostingDesc: 'Manage your code repositories with full Git support. Create, edit, and collaborate on projects with your team.',
    gitSupport: 'Git Support',
    fullVersionControl: 'Full version control',
    fileManagement: 'File Management',
    easyFileEditing: 'Easy file editing',
    accessControl: 'Access Control',
    publicAndPrivate: 'Public & Private',
    createFirstRepo: 'Create your first repository',
    updated: 'Updated',
    
    // FAQ
    frequentlyAskedQuestions: 'Frequently Asked Questions',
    search: 'Search',
    findAnswers: 'Find answers to the most frequently asked questions',
    searchQuestions: 'Search questions...',
    noFAQsFound: 'No FAQs found',
    stillHaveQuestions: 'Still have questions?',
    cantFindAnswer: "Can't find the answer you're looking for? Contact our support team.",
    
    // Common
    by: 'By',
    noPostsYet: 'No posts yet',
    noAchievementsYet: 'No achievements yet',
    noRepositoriesYet: 'No repositories yet',
    noItemsYet: 'No items yet',
    noPinnedPostsYet: 'No pinned posts yet',
    noFeaturedAchievementsYet: 'No featured achievements yet',
    subject: 'Subject',
    message: 'Message',
    
    // Admin Team
    adminAccounts: 'Admin Accounts',
    adminAccountsDesc: 'The admin team who manage the site',
    noAdmins: 'No admins currently',
  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ar')

  useEffect(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar'
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLanguage
  }

  const t = (key) => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isRTL: language === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
