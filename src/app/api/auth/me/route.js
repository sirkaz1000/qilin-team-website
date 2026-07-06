const { getUserById, verifyToken, hashPassword } = require('@/lib/auth-simple')
const { query } = require('@/lib/postgres')

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

    // Build dynamic update query
    const updates = []
    const values = []
    let paramIndex = 1

    if (displayName !== undefined) {
      updates.push(`display_name = $${paramIndex}`)
      values.push(displayName.trim())
      paramIndex++
    }

    if (username !== undefined) {
      // Check if username is already taken
      const existingUser = await query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username.trim(), decoded.userId]
      )
      if (existingUser.length > 0) {
        return Response.json({ error: 'Username already taken' }, { status: 400 })
      }
      updates.push(`username = $${paramIndex}`)
      values.push(username.trim())
      paramIndex++
    }

    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramIndex}`)
      values.push(avatarUrl.trim())
      paramIndex++
    }

    if (password !== undefined) {
      const passwordHash = await hashPassword(password)
      updates.push(`password_hash = $${paramIndex}`)
      values.push(passwordHash)
      paramIndex++
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Add user ID as last parameter
    values.push(decoded.userId)

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, username, email, display_name, role, avatar_url, is_active, created_at`,
      values
    )

    if (result.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = {
      id: result[0].id,
      username: result[0].username,
      email: result[0].email,
      displayName: result[0].display_name,
      avatarUrl: result[0].avatar_url,
      role: result[0].role,
      isActive: result[0].is_active,
      createdAt: result[0].created_at,
    }

    return Response.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return Response.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
