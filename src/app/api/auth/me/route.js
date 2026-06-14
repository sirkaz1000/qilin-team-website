const { getUserById, verifyToken } = require('@/lib/auth-simple')

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
    const { password_hash: _, ...userWithoutPassword } = user

    return Response.json(userWithoutPassword)
  } catch (error) {
    console.error('Get user error:', error)
    return Response.json({ error: 'Failed to get user' }, { status: 500 })
  }
}
