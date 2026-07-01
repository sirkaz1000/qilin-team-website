const { verifyToken, hashPassword } = require('@/lib/auth-simple')
const { readDataFile, writeDataFile } = require('@/lib/data-simple')

export async function POST(request) {
  try {
    console.log('=== Update Profile POST Request ===')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid auth header')
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    console.log('Decoded token:', decoded)

    if (!decoded) {
      console.log('Invalid token')
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { displayName, username, avatarUrl, password } = body
    console.log('Request body:', { displayName, username, hasAvatarUrl: !!avatarUrl, hasPassword: !!password })

    const users = readDataFile('users.json')
    const userIndex = users.findIndex(u => u.id === decoded.userId)
    console.log('User index:', userIndex)

    if (userIndex === -1) {
      console.log('User not found')
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Update fields if provided
    if (displayName !== undefined) {
      users[userIndex].displayName = displayName.trim()
      console.log('Updated displayName')
    }

    if (username !== undefined) {
      // Check if username is already taken
      const existingUser = users.find(u => u.username === username && u.id !== decoded.userId)
      if (existingUser) {
        console.log('Username already taken')
        return Response.json({ error: 'Username already taken' }, { status: 400 })
      }
      users[userIndex].username = username.trim()
      console.log('Updated username')
    }

    if (avatarUrl !== undefined) {
      users[userIndex].avatarUrl = avatarUrl.trim()
      console.log('Updated avatarUrl')
    }

    if (password !== undefined) {
      users[userIndex].passwordHash = hashPassword(password)
      console.log('Updated password')
    }

    writeDataFile('users.json', users)
    console.log('User data saved successfully')

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

    console.log('Profile updated successfully:', { id: updatedUser.id, username: updatedUser.username, hasAvatarUrl: !!updatedUser.avatarUrl })
    return Response.json(updatedUser)
  } catch (error) {
    console.error('=== Update Profile Error ===')
    console.error('Error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return Response.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
