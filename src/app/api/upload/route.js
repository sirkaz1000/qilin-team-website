const { verifyToken } = require('@/lib/auth-simple')

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

    // Convert file to Base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    
    // Create data URL
    const dataUrl = `data:${file.type};base64,${base64}`

    return Response.json({ url: dataUrl })
  } catch (error) {
    console.error('Error uploading file:', error)
    return Response.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
