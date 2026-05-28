const { verifyToken } = require('@/lib/auth-simple')
const { readDataFile, writeDataFile } = require('@/lib/data-simple')

// Input validation helpers
function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input.replace(/[<>]/g, '')
}

function validateRole(role) {
  if (!role) return { isValid: true }
  if (!['USER', 'ADMIN'].includes(role)) {
    return { isValid: false, error: 'Invalid role' }
  }
  return { isValid: true }
}

export async function GET(request) {
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

    if (!user || user.role !== 'ADMIN' || !user.isActive) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const usersList = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return Response.json(usersList)
  } catch (error) {
    console.error('Error fetching users:', error)
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
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

    const users = readDataFile('users.json')
    const currentUser = users.find(u => u.id === decoded.userId)

    if (!currentUser || currentUser.role !== 'ADMIN' || !currentUser.isActive) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, isActive, role } = body

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Validate role if provided
    if (role !== undefined) {
      const roleValidation = validateRole(role)
      if (!roleValidation.isValid) {
        return Response.json({ error: roleValidation.error }, { status: 400 })
      }
    }

    const userIndex = users.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    if (isActive !== undefined) {
      users[userIndex].isActive = isActive
    }
    if (role !== undefined) {
      users[userIndex].role = sanitizeInput(role)
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
