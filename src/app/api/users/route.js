const { verifyToken, hashPassword, updateUserProfile, updateUserAdmin, getUserById } = require('@/lib/auth-simple')
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
    console.log('Auth header:', authHeader)
    
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

    // For listing users, prefer the JSON file (admin UI) — keep existing behaviour
    const users = readDataFile('users.json')
    // normalize id comparison to string to avoid type mismatch
    const user = users.find(u => String(u.id) === String(decoded.userId))
    console.log('Current user:', user)

    if (!user || user.role !== 'ADMIN' || !user.isActive) {
      console.log('User is not admin or not active')
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

    console.log('Returning users list:', usersList)
    return Response.json(usersList)
  } catch (error) {
    console.error('Error fetching users:', error)
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// Helper: if a user isn't in users.json, try to fetch from DB and append
async function ensureUserInJson(users, targetId) {
  const idx = users.findIndex(u => String(u.id) === String(targetId))
  if (idx !== -1) return idx

  try {
    const dbUser = await getUserById(targetId)
    if (!dbUser) return -1

    const newUser = {
      id: String(dbUser.id),
      username: dbUser.username,
      email: dbUser.email,
      displayName: dbUser.displayName || dbUser.display_name || '',
      avatarUrl: dbUser.avatarUrl || dbUser.avatar_url || null,
      role: dbUser.role || 'USER',
      isActive: dbUser.isActive !== undefined ? dbUser.isActive : true,
      createdAt: dbUser.createdAt || new Date().toISOString(),
      // passwordHash may not be returned by getUserById; keep absent or null
    }

    users.push(newUser)
    const ok = writeDataFile('users.json', users)
    if (!ok) {
      console.error('Failed to persist users.json when syncing from DB')
      return -1
    }

    return users.findIndex(u => String(u.id) === String(targetId))
  } catch (err) {
    console.error('Error ensuring user in JSON:', err)
    return -1
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
      // Ensure the current user (admin) exists in DB or JSON
      // Prefer DB check for admin
      const admin = await getUserById(decoded.userId)
      if (!admin || admin.role !== 'ADMIN' || !admin.isActive) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      // Validate role if provided
      if (role !== undefined) {
        const roleValidation = validateRole(role)
        if (!roleValidation.isValid) {
          return Response.json({ error: roleValidation.error }, { status: 400 })
        }
      }

      // Perform admin update directly in DB
      const updated = await updateUserAdmin(userId, { isActive, role })
      if (!updated) return Response.json({ error: 'User not found' }, { status: 404 })

      // Sync to JSON (best-effort) so admin UI shows updated info
      try {
        const users = readDataFile('users.json')
        let idx = users.findIndex(u => String(u.id) === String(userId))
        if (idx === -1) {
          idx = await ensureUserInJson(users, userId)
        }
        if (idx !== -1) {
          users[idx].isActive = updated.isActive
          users[idx].role = updated.role
          writeDataFile('users.json', users)
        }
      } catch (e) {
        console.warn('Could not sync admin update to users.json:', e)
      }

      return Response.json(updated)
    } else {
      // Update current user's own data
      const currentUserId = decoded.userId

      // Perform DB update for profile fields
      try {
        const updated = await updateUserProfile(currentUserId, { displayName, username, avatarUrl, password })
        if (!updated) return Response.json({ error: 'User not found' }, { status: 404 })

        // Sync to JSON (best-effort)
        try {
          const users = readDataFile('users.json')
          let idx = users.findIndex(u => String(u.id) === String(currentUserId))
          if (idx === -1) {
            idx = await ensureUserInJson(users, currentUserId)
          }
          if (idx !== -1) {
            users[idx].displayName = updated.displayName
            users[idx].username = updated.username
            users[idx].avatarUrl = updated.avatarUrl
            writeDataFile('users.json', users)
          }
        } catch (e) {
          console.warn('Could not sync profile update to users.json:', e)
        }

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
