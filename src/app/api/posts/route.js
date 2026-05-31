const { verifyToken } = require('@/lib/auth-simple')
const { readDataFile, writeDataFile, generateId } = require('@/lib/data-simple')

// Input validation helpers
function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input.replace(/[<>]/g, '')
}

function validateTitle(title) {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Title is required' }
  }
  if (title.length > 200) {
    return { isValid: false, error: 'Title must be less than 200 characters' }
  }
  return { isValid: true }
}

function validateContent(content) {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Content is required' }
  }
  if (content.length > 10000) {
    return { isValid: false, error: 'Content must be less than 10000 characters' }
  }
  return { isValid: true }
}

export async function GET(request) {
  try {
    const posts = await getPosts()
    return Response.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return Response.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }

    const users = readDataFile('users.json')
    const user = users.find(u => u.id === decoded.userId)

    if (!user || !user.isActive) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, content, isPinned, imageUrl, videoUrl } = body

    // Validate title
    const titleValidation = validateTitle(title)
    if (!titleValidation.isValid) {
      return Response.json({ error: titleValidation.error }, { status: 400 })
    }

    // Validate content
    const contentValidation = validateContent(content)
    if (!contentValidation.isValid) {
      return Response.json({ error: contentValidation.error }, { status: 400 })
    }

    const newPost = await createPost({
      title: sanitizeInput(title.trim()),
      content: sanitizeInput(content.trim()),
      authorId: user.id,
      username: user.username,
      displayName: user.displayName,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      isPinned: isPinned || false,
    })

    return Response.json(newPost)
  } catch (error) {
    console.error('Error creating post:', error)
    return Response.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
