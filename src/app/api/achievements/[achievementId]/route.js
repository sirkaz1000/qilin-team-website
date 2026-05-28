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
    const achievements = readDataFile('achievements.json')
    const achievement = achievements.find(a => a.id === params.achievementId)

    if (!achievement) {
      return Response.json({ error: 'Achievement not found' }, { status: 404 })
    }

    const users = readDataFile('users.json')
    const achievementWithAuthor = {
      ...achievement,
      author: {
        username: users.find(u => u.id === achievement.authorId)?.username || 'Unknown',
        displayName: users.find(u => u.id === achievement.authorId)?.displayName || 'Unknown'
      }
    }

    return Response.json(achievementWithAuthor)
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

    const users = readDataFile('users.json')
    const user = users.find(u => u.id === decoded.userId)

    if (!user || !user.isActive) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const achievements = readDataFile('achievements.json')
    const achievementIndex = achievements.findIndex(a => a.id === params.achievementId)

    if (achievementIndex === -1) {
      return Response.json({ error: 'Achievement not found' }, { status: 404 })
    }

    const achievement = achievements[achievementIndex]

    // Check if user is admin or achievement author
    if (user.role !== 'ADMIN' && achievement.authorId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, iconUrl, imageUrl, videoUrl, isFeatured, commentsClosed } = body

    // Validate title if provided
    if (title !== undefined) {
      const titleValidation = validateTitle(title)
      if (!titleValidation.isValid) {
        return Response.json({ error: titleValidation.error }, { status: 400 })
      }
      achievements[achievementIndex].title = sanitizeInput(title.trim())
    }

    // Validate description if provided
    if (description !== undefined) {
      const descriptionValidation = validateDescription(description)
      if (!descriptionValidation.isValid) {
        return Response.json({ error: descriptionValidation.error }, { status: 400 })
      }
      achievements[achievementIndex].description = sanitizeInput(description.trim())
    }

    if (iconUrl !== undefined) {
      achievements[achievementIndex].iconUrl = sanitizeInput(iconUrl)
    }

    if (imageUrl !== undefined) {
      achievements[achievementIndex].imageUrl = sanitizeInput(imageUrl)
    }

    if (videoUrl !== undefined) {
      achievements[achievementIndex].videoUrl = sanitizeInput(videoUrl)
    }

    if (isFeatured !== undefined) {
      achievements[achievementIndex].isFeatured = isFeatured
    }

    if (commentsClosed !== undefined) {
      achievements[achievementIndex].commentsClosed = commentsClosed
    }

    writeDataFile('achievements.json', achievements)

    const updatedAchievement = {
      ...achievements[achievementIndex],
      author: {
        username: users.find(u => u.id === achievements[achievementIndex].authorId)?.username || 'Unknown',
        displayName: users.find(u => u.id === achievements[achievementIndex].authorId)?.displayName || 'Unknown'
      }
    }

    return Response.json(updatedAchievement)
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

    const users = readDataFile('users.json')
    const user = users.find(u => u.id === decoded.userId)

    if (!user || !user.isActive) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const achievements = readDataFile('achievements.json')
    const achievementIndex = achievements.findIndex(a => a.id === params.achievementId)

    if (achievementIndex === -1) {
      return Response.json({ error: 'Achievement not found' }, { status: 404 })
    }

    const achievement = achievements[achievementIndex]

    // Check if user is admin or achievement author
    if (user.role !== 'ADMIN' && achievement.authorId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    achievements.splice(achievementIndex, 1)
    writeDataFile('achievements.json', achievements)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting achievement:', error)
    return Response.json({ error: 'Failed to delete achievement' }, { status: 500 })
  }
}
