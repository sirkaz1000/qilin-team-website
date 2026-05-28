const { createUser, generateToken, validatePasswordStrength } = require('@/lib/auth-simple')

// Input validation helpers
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validateUsername(username) {
  // Username: 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  // Remove potentially dangerous characters
  return input.replace(/[<>]/g, '')
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, confirmPassword, displayName, username, avatarUrl } = body

    // Basic validation
    if (!email || !password || !displayName || !username) {
      return Response.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Validate email format
    if (!validateEmail(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate username format
    if (!validateUsername(username)) {
      return Response.json({ error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return Response.json({ error: passwordValidation.errors.join(', ') }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return Response.json({ error: 'Passwords do not match' }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim())
    const sanitizedDisplayName = sanitizeInput(displayName.trim())
    const sanitizedUsername = sanitizeInput(username.trim())
    const sanitizedAvatarUrl = avatarUrl ? sanitizeInput(avatarUrl.trim()) : null

    // Create user
    const user = await createUser(sanitizedUsername, sanitizedEmail, password, sanitizedDisplayName, 'USER')

    // Add avatarUrl if provided
    if (sanitizedAvatarUrl) {
      user.avatarUrl = sanitizedAvatarUrl
    }

    // Generate token
    const token = generateToken(user.id)

    return Response.json({
      token,
      user: user,
    })
  } catch (error) {
    console.error('Registration error:', error)
    // Don't expose detailed error messages
    return Response.json({ error: error.message || 'Registration failed' }, { status: 400 })
  }
}
