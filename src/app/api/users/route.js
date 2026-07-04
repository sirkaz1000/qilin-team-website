const { verifyToken, hashPassword, updateUserProfile, updateUserAdmin, getUserById, getAllUsers } = require('@/lib/auth-simple')

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

function toAbsoluteUrl(url, request) {
  if (!url) return null
  if (url.startsWith('http')) return url
  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL || (request && request.headers && request.headers.get('origin')) || ''
    if (origin) return `${origin}${url.startsWith('/') ? '' : '/'}${url}`
    return url.startsWith('/') ? url : `/${url}`
  } catch (e) {
    return url
  }
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

    // Prefer DB for authoritative user list
    const currentUser = await getUserById(decoded.userId)
    if (!currentUser || currentUser.role !== 'ADMIN' || !currentUser.isActive) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await getAllUsers()
    const usersList = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      displayName: u.displayName,
      avatarUrl: toAbsoluteUrl(u.avatarUrl, request),
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }))

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

    const body = await request.json()
    const { userId, isActive, role, displayName, username, avatarUrl, password } = body

    // If userId is provided, update that user (admin only)
    if (userId) {
      const admin = await getUserById(decoded.userId)
      if (!admin || admin.role !== 'ADMIN' || !admin.isActive) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (role !== undefined) {
        const roleValidation = validateRole(role)
        if (!roleValidation.isValid) {
          return Response.json({ error: roleValidation.error }, { status: 400 })
        }
      }

      // Perform admin update directly in DB
      const updated = await updateUserAdmin(userId, { isActive, role })
      if (!updated) return Response.json({ error: 'User not found' }, { status: 404 })

      return Response.json(updated)
    } else {
      // Update current user's own data
      const currentUserId = decoded.userId

      try {
        const updated = await updateUserProfile(currentUserId, { displayName, username, avatarUrl, password })
        if (!updated) return Response.json({ error: 'User not found' }, { status: 404 })

        return Response.json(updated)
      } catch (err) {
        if (err.code === 'USERNAME_TAKEN') {
          return Response.json({ error: 'Username already taken' }, { status: 400 })
        }
        console.error('Error updating user in DB:', err)
        return Response.json({ error: 'Failed to update user' }, { status: 500 })
      }
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return Response.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
