const { hashPassword } = require('@/lib/auth-simple')
const { readDataFile, writeDataFile, generateId } = require('@/lib/data-simple')

export async function POST(request) {
  try {
    const body = await request.json()
    const { username, email, password, displayName } = body

    // Validate input
    if (!username || !email || !password || !displayName) {
      return Response.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check if user already exists
    const users = readDataFile('users.json')
    const existingUser = users.find(u => u.username === username || u.email === email)

    if (existingUser) {
      return Response.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const passwordHash = hashPassword(password)

    // Create admin user
    const admin = {
      id: generateId(),
      username,
      email,
      passwordHash,
      displayName,
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date().toISOString()
    }
    users.push(admin)
    writeDataFile('users.json', users)

    return Response.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        displayName: admin.displayName,
        role: admin.role,
        isActive: admin.isActive,
      },
    })
  } catch (error) {
    console.error('Error creating admin:', error)
    return Response.json({ error: 'Failed to create admin account', details: error.message }, { status: 500 })
  }
}
