const { authenticateUser, generateToken } = require('@/lib/auth-simple')

// Input validation helper
function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input.replace(/[<>]/g, '')
}

export async function POST(request) {
  try {
    console.log('=== Login Request ===')
    const body = await request.json()
    console.log('Request body:', { username: body.username, hasPassword: !!body.password })
    const { username, password } = body

    console.log('Login attempt for username:', username)

    // Validation
    if (!username || !password) {
      console.log('Validation failed: missing username or password')
      return Response.json({ error: 'Username and password are required' }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedUsername = sanitizeInput(username.trim())
    console.log('Sanitized username:', sanitizedUsername)

    // Authenticate user
    console.log('Attempting to authenticate user...')
    const user = await authenticateUser(sanitizedUsername, password)
    console.log('Authentication successful for user:', { id: user.id, username: user.username, displayName: user.displayName })

    // Generate token
    const token = generateToken(user.id)
    console.log('Token generated successfully')

    const response = Response.json({
      token,
      user: user,
    })
    console.log('Login successful')
    return response
  } catch (error) {
    console.error('=== Login Error ===')
    console.error('Error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    // Don't expose detailed error messages
    return Response.json({ error: error.message || 'Login failed' }, { status: 401 })
  }
}
