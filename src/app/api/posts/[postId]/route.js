const { verifyToken } = require('@/lib/auth')
const { getUserById } = require('@/lib/auth-simple')
const { query } = require('@/lib/postgres')
const { toCamelCase } = require('@/lib/data-simple')

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
    const result = await query('SELECT * FROM "Post" WHERE id = $1', [params.postId])
    if (result.length === 0) {
      return Response.json({ error: 'Post not found' }, { status: 404 })
    }

    const post = toCamelCase(result[0])
    const author = await getUserById(post.authorId)
    
    return Response.json({
      ...post,
      author: {
        username: author?.username || 'Unknown',
        displayName: author?.displayName || 'Unknown'
      }
    })
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

    const user = await getUserById(decoded.userId)

    if (!user || !user.isActive) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const result = await query('SELECT * FROM "Post" WHERE id = $1', [params.postId])
    if (result.length === 0) {
      return Response.json({ error: 'Post not found' }, { status: 404 })
    }

    const post = toCamelCase(result[0])

    // Check if user is admin or post author
    if (user.role !== 'ADMIN' && post.authorId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, isPinned, imageUrl, videoUrl } = body

    const fields = []
    const values = []
    let idx = 1

    if (title !== undefined) {
      const titleValidation = validateTitle(title)
      if (!titleValidation.isValid) return Response.json({ error: titleValidation.error }, { status: 400 })
      fields.push(`title=$${idx++}`); values.push(sanitizeInput(title.trim()))
    }
    if (content !== undefined) {
      const contentValidation = validateContent(content)
      if (!contentValidation.isValid) return Response.json({ error: contentValidation.error }, { status: 400 })
      fields.push(`content=$${idx++}`); values.push(sanitizeInput(content.trim()))
    }
    if (isPinned !== undefined) { fields.push(`"isPinned"=$${idx++}`); values.push(isPinned) }
    
    if (fields.length === 0) return Response.json(post)

    values.push(params.postId)
    const updateResult = await query(
      `UPDATE "Post" SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )

    const updatedPost = toCamelCase(updateResult[0])
    return Response.json({
      ...updatedPost,
      author: {
        username: user.username,
        displayName: user.displayName
      }
    })
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

    const user = await getUserById(decoded.userId)

    if (!user || !user.isActive) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const result = await query('SELECT * FROM "Post" WHERE id = $1', [params.postId])
    if (result.length === 0) {
      return Response.json({ error: 'Post not found' }, { status: 404 })
    }

    const post = toCamelCase(result[0])

    // Check if user is admin or post author
    if (user.role !== 'ADMIN' && post.authorId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    await query('DELETE FROM "Post" WHERE id = $1', [params.postId])

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return Response.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
