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

function validateDescription(description) {
  if (!description || description.trim().length === 0) {
    return { isValid: false, error: 'Description is required' }
  }
  if (description.length > 10000) {
    return { isValid: false, error: 'Description must be less than 10000 characters' }
  }
  return { isValid: true }
}

export async function GET(request, { params }) {
  try {
    const result = await query('SELECT * FROM "Achievement" WHERE id = $1', [params.achievementId])
    if (result.length === 0) {
      return Response.json({ error: 'Achievement not found' }, { status: 404 })
    }

    const achievement = toCamelCase(result[0])
    const author = await getUserById(achievement.authorId)
    
    return Response.json({
      ...achievement,
      author: {
        username: author?.username || 'Unknown',
        displayName: author?.displayName || 'Unknown'
      }
    })
  } catch (error) {
    console.error('Error fetching achievement:', error)
    return Response.json({ error: 'Failed to fetch achievement' }, { status: 500 })
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

    const result = await query('SELECT * FROM "Achievement" WHERE id = $1', [params.achievementId])
    if (result.length === 0) {
      return Response.json({ error: 'Achievement not found' }, { status: 404 })
    }

    const achievement = toCamelCase(result[0])

    // Check if user is admin or achievement author
    if (user.role !== 'ADMIN' && achievement.authorId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, iconUrl, imageUrl, videoUrl, isFeatured } = body

    const fields = []
    const values = []
    let idx = 1

    if (title !== undefined) {
      const titleValidation = validateTitle(title)
      if (!titleValidation.isValid) return Response.json({ error: titleValidation.error }, { status: 400 })
      fields.push(`title=$${idx++}`); values.push(sanitizeInput(title.trim()))
    }
    if (description !== undefined) {
      const descriptionValidation = validateDescription(description)
      if (!descriptionValidation.isValid) return Response.json({ error: descriptionValidation.error }, { status: 400 })
      fields.push(`description=$${idx++}`); values.push(sanitizeInput(description.trim()))
    }
    if (iconUrl !== undefined) { fields.push(`"iconUrl"=$${idx++}`); values.push(sanitizeInput(iconUrl)) }
    if (isFeatured !== undefined) { fields.push(`"isFeatured"=$${idx++}`); values.push(isFeatured) }

    if (fields.length === 0) return Response.json(achievement)

    values.push(params.achievementId)
    const updateResult = await query(
      `UPDATE "Achievement" SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )

    const updatedAchievement = toCamelCase(updateResult[0])
    return Response.json({
      ...updatedAchievement,
      author: {
        username: user.username,
        displayName: user.displayName
      }
    })
  } catch (error) {
    console.error('Error updating achievement:', error)
    return Response.json({ error: 'Failed to update achievement' }, { status: 500 })
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

    const result = await query('SELECT * FROM "Achievement" WHERE id = $1', [params.achievementId])
    if (result.length === 0) {
      return Response.json({ error: 'Achievement not found' }, { status: 404 })
    }

    const achievement = toCamelCase(result[0])

    // Check if user is admin or achievement author
    if (user.role !== 'ADMIN' && achievement.authorId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    await query('DELETE FROM "Achievement" WHERE id = $1', [params.achievementId])

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting achievement:', error)
    return Response.json({ error: 'Failed to delete achievement' }, { status: 500 })
  }
}
