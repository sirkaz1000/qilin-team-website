const { authenticateUser, generateToken } = require('@/lib/auth-simple')

// Input validation helper
function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input.replace(/[<>]/g, '')
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { username, password } = body

    console.log('Login attempt for username:', username)

    // Validation
    if (!username || !password) {
      console.log('Validation failed: missing username or password')
      return Response.json({ error: 'Username and password are required' }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedUsername = sanitizeInput(username.trim())

    // Authenticate user
    const user = await authenticateUser(sanitizedUsername, password)
    console.log('Authentication successful for user:', user.username)

    // Generate token
    const token = generateToken(user.id)
    console.log('Token generated successfully')

    const response = Response.json({
      token,
      user: user,
    })
    console.log('Login response sent successfully')
    return response
  } catch (error) {
    console.error('Login error:', error)
    console.error('Error details:', error.message)
    // Don't expose detailed error messages
    return Response.json({ error: error.message || 'Login failed' }, { status: 401 })
  }
}
