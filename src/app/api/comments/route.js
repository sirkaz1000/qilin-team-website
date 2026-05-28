const { verifyToken } = require('@/lib/auth-simple')
const { readDataFile, writeDataFile, generateId } = require('@/lib/data-simple')

// Input validation helpers
function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input.replace(/[<>]/g, '')
}

function validateCommentContent(content) {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Comment content is required' }
  }
  if (content.length > 1000) {
    return { isValid: false, error: 'Comment content must be less than 1000 characters' }
  }
  return { isValid: true }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const targetType = sanitizeInput(searchParams.get('targetType'))
    const targetId = sanitizeInput(searchParams.get('targetId'))

    const comments = readDataFile('comments.json')
    const users = readDataFile('users.json')
    
    let filteredComments = comments
    if (targetType) {
      filteredComments = filteredComments.filter(c => c.targetType === targetType)
    }
    if (targetId) {
      filteredComments = filteredComments.filter(c => c.targetId === targetId)
    }

    // Add user info to comments
    const commentsWithUsers = filteredComments.map(comment => ({
      ...comment,
      user: users.find(u => u.id === comment.userId) || { username: 'Unknown', displayName: 'Unknown', avatarUrl: null }
    }))

    return Response.json(commentsWithUsers)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return Response.json({ error: 'Failed to fetch comments' }, { status: 500 })
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
    const { content, targetType, targetId } = body

    // Validate content
    const contentValidation = validateCommentContent(content)
    if (!contentValidation.isValid) {
      return Response.json({ error: contentValidation.error }, { status: 400 })
    }

    // Validate targetType
    if (!targetType || !['POST', 'REPOSITORY'].includes(targetType)) {
      return Response.json({ error: 'Invalid target type' }, { status: 400 })
    }

    // Validate targetId
    if (!targetId) {
      return Response.json({ error: 'Target ID is required' }, { status: 400 })
    }

    // Check if comments are closed for the target
    if (targetType === 'POST') {
      const posts = readDataFile('posts.json')
      const post = posts.find(p => p.id === targetId)
      if (post && post.commentsClosed) {
        return Response.json({ error: 'Comments are closed for this post' }, { status: 403 })
      }
    }

    const comments = readDataFile('comments.json')
    const newComment = {
      id: generateId(),
      content: sanitizeInput(content.trim()),
      userId: user.id,
      targetType: sanitizeInput(targetType),
      targetId: sanitizeInput(targetId),
      createdAt: new Date().toISOString()
    }
    comments.push(newComment)
    writeDataFile('comments.json', comments)

    // Add user info to response
    const commentWithUser = {
      ...newComment,
      user: { username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl }
    }

    return Response.json(commentWithUser)
  } catch (error) {
    console.error('Error creating comment:', error)
    return Response.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

export async function DELETE(request) {
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

    const { searchParams } = new URL(request.url)
    const commentId = sanitizeInput(searchParams.get('commentId'))

    if (!commentId) {
      return Response.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    const comments = readDataFile('comments.json')
    const commentIndex = comments.findIndex(c => c.id === commentId)

    if (commentIndex === -1) {
      return Response.json({ error: 'Comment not found' }, { status: 404 })
    }

    const comment = comments[commentIndex]

    if (user.role !== 'ADMIN' && comment.userId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    comments.splice(commentIndex, 1)
    writeDataFile('comments.json', comments)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return Response.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
