const { verifyToken } = require('@/lib/auth-simple')
const { readDataFile, writeDataFile } = require('@/lib/data-simple')

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

export async function GET(request, { params }) {
  try {
    const posts = readDataFile('posts.json')
    const post = posts.find(p => p.id === params.postId)

    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 })
    }

    const users = readDataFile('users.json')
    const postWithAuthor = {
      ...post,
      author: {
        username: users.find(u => u.id === post.authorId)?.username || 'Unknown',
        displayName: users.find(u => u.id === post.authorId)?.displayName || 'Unknown'
      }
    }

    return Response.json(postWithAuthor)
  } catch (error) {
    console.error('Error fetching post:', error)
    return Response.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
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

    const posts = readDataFile('posts.json')
    const postIndex = posts.findIndex(p => p.id === params.postId)

    if (postIndex === -1) {
      return Response.json({ error: 'Post not found' }, { status: 404 })
    }

    const post = posts[postIndex]

    // Check if user is admin or post author
    if (user.role !== 'ADMIN' && post.authorId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, isPinned, commentsClosed, imageUrl, videoUrl } = body

    // Validate title if provided
    if (title !== undefined) {
      const titleValidation = validateTitle(title)
      if (!titleValidation.isValid) {
        return Response.json({ error: titleValidation.error }, { status: 400 })
      }
      posts[postIndex].title = sanitizeInput(title.trim())
    }

    // Validate content if provided
    if (content !== undefined) {
      const contentValidation = validateContent(content)
      if (!contentValidation.isValid) {
        return Response.json({ error: contentValidation.error }, { status: 400 })
      }
      posts[postIndex].content = sanitizeInput(content.trim())
    }

    if (isPinned !== undefined) {
      posts[postIndex].isPinned = isPinned
    }

    if (commentsClosed !== undefined) {
      posts[postIndex].commentsClosed = commentsClosed
    }

    if (imageUrl !== undefined) {
      posts[postIndex].imageUrl = sanitizeInput(imageUrl)
    }

    if (videoUrl !== undefined) {
      posts[postIndex].videoUrl = sanitizeInput(videoUrl)
    }

    writeDataFile('posts.json', posts)

    const updatedPost = {
      ...posts[postIndex],
      author: {
        username: users.find(u => u.id === posts[postIndex].authorId)?.username || 'Unknown',
        displayName: users.find(u => u.id === posts[postIndex].authorId)?.displayName || 'Unknown'
      }
    }

    return Response.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return Response.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
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

    const posts = readDataFile('posts.json')
    const postIndex = posts.findIndex(p => p.id === params.postId)

    if (postIndex === -1) {
      return Response.json({ error: 'Post not found' }, { status: 404 })
    }

    const post = posts[postIndex]

    // Check if user is admin or post author
    if (user.role !== 'ADMIN' && post.authorId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    posts.splice(postIndex, 1)
    writeDataFile('posts.json', posts)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return Response.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
