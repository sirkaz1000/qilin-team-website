const { verifyToken } = require('@/lib/auth')
const { getUserById, toCamelCase, hashPassword } = require('@/lib/auth-simple')
const { readDataFile, writeDataFile } = require('@/lib/data-simple')

export async function GET(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user from database
    const user = await getUserById(decoded.userId)

    if (!user || !user.isActive) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Return user data without password
    const { passwordHash: _, ...userWithoutPassword } = user

    return Response.json(userWithoutPassword)
  } catch (error) {
    console.error('Get user error:', error)
    return Response.json({ error: 'Failed to get user' }, { status: 500 })
  }
}

const { updateUserProfile } = require('@/lib/auth-simple')

export async function PATCH(request) {
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

    const body = await request.json()
    const { displayName, username, avatarUrl, password } = body

    try {
      const updatedUser = await updateUserProfile(decoded.userId, { displayName, username, avatarUrl, password })
      if (!updatedUser) return Response.json({ error: 'User not found' }, { status: 404 })
      return Response.json(updatedUser)
    } catch (err) {
      if (err.code === 'USERNAME_TAKEN') {
        return Response.json({ error: 'Username already taken' }, { status: 400 })
      }
      throw err
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return Response.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
