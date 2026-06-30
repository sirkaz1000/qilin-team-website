const { getUserById, verifyToken, toCamelCase, hashPassword } = require('@/lib/auth-simple')
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

    const users = readDataFile('users.json')
    const userIndex = users.findIndex(u => u.id === decoded.userId)

    if (userIndex === -1) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    if (displayName !== undefined) {
      users[userIndex].displayName = displayName
    }

    if (username !== undefined) {
      // Check if username is already taken
      const existingUser = users.find(u => u.username === username && u.id !== decoded.userId)
      if (existingUser) {
        return Response.json({ error: 'Username already taken' }, { status: 400 })
      }
      users[userIndex].username = username
    }

    if (avatarUrl !== undefined) {
      users[userIndex].avatarUrl = avatarUrl
    }

    if (password !== undefined) {
      users[userIndex].passwordHash = hashPassword(password)
    }

    writeDataFile('users.json', users)

    const updatedUser = {
      id: users[userIndex].id,
      username: users[userIndex].username,
      email: users[userIndex].email,
      displayName: users[userIndex].displayName,
      avatarUrl: users[userIndex].avatarUrl,
      role: users[userIndex].role,
      isActive: users[userIndex].isActive,
      createdAt: users[userIndex].createdAt,
    }

    return Response.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return Response.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
