const { verifyToken } = require('@/lib/auth-simple')
const { writeFile, mkdir } = require('fs/promises')
const { join } = require('path')
const crypto = require('crypto')

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Allow upload without token for registration
    let decoded = null
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      decoded = verifyToken(token)
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type - allow images and videos
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
    ]
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Invalid file type. Allowed: images (JPEG, PNG, GIF, WebP, SVG) and videos (MP4, WebM, OGG, MOV)' }, { status: 400 })
    }

    // Validate file size (max 50MB for videos, 5MB for images)
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      return Response.json({ error: `File too large (max ${isVideo ? '50MB' : '5MB'})` }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `${crypto.randomUUID()}.${ext}`
    
    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Return URL
    const url = `/uploads/${filename}`
    return Response.json({ url })
  } catch (error) {
    console.error('Error uploading file:', error)
    return Response.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
