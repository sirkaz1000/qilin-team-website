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
    console.log('=== Registration Request ===')
    const body = await request.json()
    console.log('Request body:', { email: body.email, username: body.username, displayName: body.displayName, hasPassword: !!body.password, hasAvatarUrl: !!body.avatarUrl })
    const { email, password, confirmPassword, displayName, username, avatarUrl } = body

    // Basic validation
    if (!email || !password || !displayName || !username) {
      console.log('Validation failed: missing required fields')
      return Response.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Validate email format
    if (!validateEmail(email)) {
      console.log('Validation failed: invalid email format')
      return Response.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate username format
    if (!validateUsername(username)) {
      console.log('Validation failed: invalid username format')
      return Response.json({ error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      console.log('Validation failed: password too weak', passwordValidation.errors)
      return Response.json({ error: passwordValidation.errors.join(', ') }, { status: 400 })
    }

    if (password !== confirmPassword) {
      console.log('Validation failed: passwords do not match')
      return Response.json({ error: 'Passwords do not match' }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim())
    const sanitizedDisplayName = sanitizeInput(displayName.trim())
    const sanitizedUsername = sanitizeInput(username.trim())
    const sanitizedAvatarUrl = avatarUrl ? sanitizeInput(avatarUrl.trim()) : null

    console.log('Sanitized inputs:', { sanitizedEmail, sanitizedUsername, sanitizedDisplayName, hasAvatarUrl: !!sanitizedAvatarUrl })

    // Create user
    console.log('Attempting to create user...')
    const user = await createUser(sanitizedUsername, sanitizedEmail, password, sanitizedDisplayName, 'USER', sanitizedAvatarUrl)
    console.log('User created successfully:', { id: user.id, username: user.username, hasAvatarUrl: !!user.avatarUrl })

    // Generate token
    const token = generateToken(user.id)
    console.log('Token generated successfully')

    const response = Response.json({
      token,
      user: user,
    })
    console.log('Registration successful')
    return response
  } catch (error) {
    console.error('=== Registration Error ===')
    console.error('Error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    // Don't expose detailed error messages
    return Response.json({ error: error.message || 'Registration failed' }, { status: 400 })
  }
}
