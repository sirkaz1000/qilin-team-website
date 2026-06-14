const { getUserByUsername, updateUserRole } = require('@/lib/auth-simple')

export async function POST(request) {
  try {
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
    return Response.json({ error: 'Failed to update user role', details: error.message }, { status: 500 })
  }
}
