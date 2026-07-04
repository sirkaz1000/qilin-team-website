/**
 * API Route: GET /api/files/info
 * الحصول على معلومات الملفات (بدون محتوى)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const fileType = searchParams.get('fileType')
    const userId = searchParams.get('userId')
    const referenceId = searchParams.get('referenceId')

    // بناء شروط البحث
    const where = {}
    if (fileType) where.fileType = fileType
    if (userId) where.uploadedBy = userId
    if (referenceId) where.referenceId = referenceId

    // البحث عن الملفات (بدون محتوى ثنائي)
    const files = await prisma.fileStorage.findMany({
      where,
      select: {
        id: true,
        fileName: true,
        originalName: true,
        mimeType: true,
        fileSize: true,
        fileType: true,
        referenceId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({
      success: true,
      files,
      count: files.length,
    })
  } catch (error) {
    console.error('خطأ في الحصول على معلومات الملفات:', error)
    return Response.json(
      { error: 'فشل في الحصول على معلومات الملفات' },
      { status: 500 }
    )
  }
}
