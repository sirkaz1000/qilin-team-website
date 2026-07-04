# 📊 دليل الترقية: تخزين الملفات في قاعدة البيانات

> **تاريخ التحديث**: 2026-07-04  
> **الحالة**: ✅ جاهز للتنفيذ

---

## 📋 ملخص التغييرات

تم تحويل طريقة تخزين الملفات من **حفظها في نظام الملفات** إلى **حفظها مباشرة في قاعدة البيانات**. هذا يضمن:

- ✅ لا توجود ملفات خارجية تحتاج إدارة
- ✅ سهولة النسخ الاحتياطي والاستعادة
- ✅ توافق مع منصات الاستضافة الموزعة (Vercel, Netlify, etc)
- ✅ أمان أفضل وتحكم مركزي

---

## 🔄 الملفات المحدثة والجديدة

### 1. نموذج قاعدة البيانات (Prisma Schema)
📁 **prisma/schema.prisma**

**التغييرات:**
- ✅ إضافة جدول `FileStorage` جديد لتخزين الملفات
- ✅ استبدال `avatarUrl` بـ `avatarId` في جدول `User`
- ✅ استبدال `iconUrl` بـ `iconId` في جدول `Achievement`
- ✅ استبدال `imageUrl` بـ `imageId` في جدول `StoreItem`
- ✅ إضافة `logoId` في جدول `SiteSettings`
- ✅ تحسين جدول `RepositoryFile` لتخزين الملفات الثنائية

```prisma
model FileStorage {
  id           String   @id @default(cuid())
  fileName     String
  originalName String
  mimeType     String
  fileSize     Int
  fileData     Bytes    // ✅ البيانات الثنائية الخام
  fileType     String   // AVATAR, PRODUCT_IMAGE, etc
  referenceId  String?
  uploadedBy   String
  createdAt    DateTime @default(now())
}
```

### 2. مكتبة إدارة الملفات (جديد)
📁 **src/lib/file-storage.js**

**الوظائف:**
- `uploadFile()` - رفع ملف إلى قاعدة البيانات
- `getFile()` - استرجاع ملف
- `deleteFile()` - حذف ملف
- `getUserFiles()` - قائمة ملفات المستخدم
- `getFileByType()` - البحث حسب النوع
- `getFileAsDataUrl()` - تحويل إلى data URL للعرض

### 3. API Endpoints

#### ✅ POST /api/upload
رفع ملف جديد إلى قاعدة البيانات

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.png" \
  -F "fileType=AVATAR"
```

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "cuid123...",
    "fileName": "1234567890-image.png",
    "originalName": "image.png",
    "size": 102400,
    "mimeType": "image/png",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### ✅ GET /api/files/[fileId]
تحميل ملف من قاعدة البيانات

```bash
curl -X GET http://localhost:3000/api/files/cuid123...
# يرجع محتوى الملف مباشرة (صورة، فيديو، إلخ)
```

#### ✅ DELETE /api/files/[fileId]
حذف ملف

```bash
curl -X DELETE http://localhost:3000/api/files/cuid123... \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### ✅ GET /api/files/info
الحصول على معلومات الملفات (بدون محتوى)

```bash
curl -X GET "http://localhost:3000/api/files/info?fileType=AVATAR&userId=user123"
```

### 4. مكون React (جديد)
📁 **src/components/FileUpload.js**

```jsx
import FileUpload from '@/components/FileUpload'

export default function MyComponent() {
  return (
    <FileUpload 
      fileType="AVATAR"
      maxSize={5}
      accept="image/*"
      onUploadSuccess={(file) => console.log('تم الرفع:', file)}
      onUploadError={(error) => console.log('خطأ:', error)}
    />
  )
}
```

---

## 🚀 خطوات التنفيذ

### المرحلة 1: تحديث قاعدة البيانات

```bash
# 1. تحديث schema.prisma
cp prisma/schema.prisma.new prisma/schema.prisma

# 2. تشغيل migration
npx prisma migrate dev --name add_file_storage

# أو يدويًا إذا كنت تستخدم PostgreSQL:
psql -U user -d database -f migrations/001_add_file_storage.sql
```

### المرحلة 2: تحديث الـ dependencies

```bash
# جميع المكتبات المطلوبة موجودة بالفعل:
npm ls @prisma/client
npm ls bcryptjs
npm ls jsonwebtoken
```

### المرحلة 3: تحديث كود التطبيق

#### 3.1. استبدال upload API
```javascript
// قديم
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})

// جديد - لا يوجد فرق في الواجهة، الفرق فقط في الخلفية
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})

// الآن يرجع معرف الملف (ID) بدل URL
const { file } = await response.json()
console.log(file.id) // استخدم هذا بدل URL
```

#### 3.2. حفظ معرف الملف بدل URL
```javascript
// قديم
await updateUser({ avatarUrl: 'https://example.com/avatar.png' })

// جديد
await updateUser({ avatarId: fileId })
```

#### 3.3. عرض الملفات
```jsx
// قديم
<img src={user.avatarUrl} alt="avatar" />

// جديد
<img src={`/api/files/${user.avatarId}`} alt="avatar" />
```

### المرحلة 4: نقل الملفات القديمة (اختياري)

إذا كان لديك ملفات قديمة محفوظة في النظام:

```javascript
// script للنقل التلقائي
import { uploadFile } from '@/lib/file-storage'
import fs from 'fs'
import path from 'path'

const PUBLIC_DIR = 'public/avatars'

async function migrateOldFiles() {
  const files = fs.readdirSync(PUBLIC_DIR)
  
  for (const file of files) {
    const filePath = path.join(PUBLIC_DIR, file)
    const fileData = fs.readFileSync(filePath)
    
    await uploadFile({
      fileData,
      fileName: file,
      originalName: file,
      mimeType: 'image/png', // تأكد من النوع الصحيح
      fileType: 'AVATAR',
      uploadedBy: 'admin',
    })
  }
  
  console.log('✅ تم نقل جميع الملفات')
}
```

---

## 📊 مقارنة: القديم vs الجديد

| الجانب | القديم | الجديد |
|--------|--------|--------|
| **المكان** | نظام ملفات الخادم | قاعدة البيانات |
| **الأمان** | ملفات عامة قد تُحذف | آمن في قاعدة البيانات |
| **النسخ الاحتياطي** | يدوي (نسخ ملفات) | تلقائي (مع قاعدة البيانات) |
| **التوسع** | مشاكل مع الخوادم الموزعة | يعمل مع أي عدد خوادم |
| **الحجم** | محدود بمساحة الخادم | محدود بـ storage قاعدة البيانات |
| **السرعة** | أسرع قليلاً | قد تكون أبطأ قليلاً (يمكن تحسينها بـ caching) |

---

## ⚙️ التحسينات المستقبلية

- [ ] إضافة CDN للملفات الكبيرة
- [ ] تحويل الصور تلقائياً (تقليل الحجم، WebP)
- [ ] نظام caching محسّن
- [ ] مشاركة آمنة للملفات (temporary URLs)
- [ ] إدارة النسخ (versioning)

---

## 🔍 استكشاف الأخطاء

### الملفات كبيرة جداً؟
```sql
-- تحقق من حد أقصى للملفات في PostgreSQL
SHOW max_allowed_packet;

-- إذا كنت تستخدم MySQL (قديم):
SET GLOBAL max_allowed_packet = 100M;
```

### بطء في تحميل الملفات؟
```javascript
// أضف caching headers
headers.set('Cache-Control', 'public, max-age=31536000')
```

### خطأ: "فشل رفع الملف"؟
```bash
# تحقق من token
echo $AUTHORIZATION_TOKEN

# تحقق من صلاحيات قاعدة البيانات
psql -U user -d database -c "SELECT * FROM FileStorage LIMIT 1;"
```

---

## 📞 الدعم

للأسئلة أو المشاكل:
1. تحقق من logs الخادم: `npm run dev`
2. تحقق من قاعدة البيانات: `npx prisma studio`
3. جرب API مباشرة: استخدم Postman أو curl

---

**✅ تم إعداد النظام بنجاح!**
