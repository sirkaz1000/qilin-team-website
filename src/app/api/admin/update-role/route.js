const { verifyToken, updateUserRole, getUserByUsername } = require('@/lib/auth-simple')

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

    // Check if the requester is an admin
    const requester = await getUserById(decoded.userId)
    if (!requester || requester.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { username, role } = body

    if (!username || !role) {
      return Response.json({ error: 'Username and role are required' }, { status: 400 })
    }

    if (role !== 'USER' && role !== 'ADMIN') {
      return Response.json({ error: 'Invalid role. Must be USER or ADMIN' }, { status: 400 })
    }

    const user = await getUserByUsername(username)
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = await updateUserRole(user.id, role)

    return Response.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('Error updating user role:', error)
    return Response.json({ error: 'Failed to update user role' }, { status: 500 })
  }
}
