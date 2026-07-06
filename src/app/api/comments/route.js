const { verifyToken } = require('@/lib/auth')
const { getUserById, getAllUsers } = require('@/lib/auth-simple')
const { query } = require('@/lib/postgres')
const { generateId, toCamelCase } = require('@/lib/data-simple')

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

    let sql = 'SELECT * FROM "Comment"'
    const params = []
    if (targetType && targetId) {
      sql += ' WHERE "targetType" = $1 AND "targetId" = $2'
      params.push(targetType, targetId)
    }
    sql += ' ORDER BY "createdAt" DESC'

    const comments = await query(sql, params)
    const users = await getAllUsers()
    
    // Add user info to comments
    const commentsWithUsers = comments.map(comment => {
      const c = toCamelCase(comment)
      return {
        ...c,
        user: users.find(u => u.id === c.userId) || { username: 'Unknown', displayName: 'Unknown', avatarUrl: null }
      }
    })

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

    const user = await getUserById(decoded.userId)

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
    if (!targetType || !['POST', 'REPOSITORY', 'ACHIEVEMENT'].includes(targetType)) {
      return Response.json({ error: 'Invalid target type' }, { status: 400 })
    }

    // Validate targetId
    if (!targetId) {
      return Response.json({ error: 'Target ID is required' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO "Comment" (id, content, "userId", "targetType", "targetId", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [generateId(), sanitizeInput(content.trim()), user.id, targetType, targetId, new Date()]
    )

    const newComment = toCamelCase(result[0])

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

    const user = await getUserById(decoded.userId)

    if (!user || !user.isActive) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const commentId = sanitizeInput(searchParams.get('commentId'))

    if (!commentId) {
      return Response.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    const result = await query('SELECT * FROM "Comment" WHERE id = $1', [commentId])
    if (result.length === 0) {
      return Response.json({ error: 'Comment not found' }, { status: 404 })
    }

    const comment = toCamelCase(result[0])

    if (user.role !== 'ADMIN' && comment.userId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    await query('DELETE FROM "Comment" WHERE id = $1', [commentId])

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return Response.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
