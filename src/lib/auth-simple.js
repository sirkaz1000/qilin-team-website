const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query } = require('./postgres')

const JWT_SECRET = process.env.JWT_SECRET || '497b4464ab148e30db01414cd960d065c696453caca9ecfd5ce64fa8ec78a4bd'

async function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Helper function to convert snake_case to camelCase
function toCamelCase(obj) {
  if (!obj || typeof obj !== 'object') return obj
  
  const newObj = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
      newObj[newKey] = obj[key]
    }
  }
  return newObj
}

async function createUser(username, email, password, displayName, role = 'USER', avatarUrl = null) {
  console.log('=== createUser (PostgreSQL) ===')
  console.log('Parameters:', { username, email, displayName, role, hasAvatarUrl: !!avatarUrl })
  
  // Check if user already exists
  const existingUser = await query(
    'SELECT id FROM users WHERE username = $1 OR email = $2',
    [username, email]
  )
  
  if (existingUser.length > 0) {
    console.log('User already exists:', { username, email })
    throw new Error('User already exists')
  }
  
  // Hash password
  console.log('Hashing password...')
  const passwordHash = await hashPassword(password)
  console.log('Password hashed successfully')
  
  // Create user
  const result = await query(
    `INSERT INTO users (username, email, password_hash, display_name, role, avatar_url, is_active, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, username, email, display_name, role, avatar_url, is_active, created_at`,
    [username, email, passwordHash, displayName, role, avatarUrl, true, new Date()]
  )
  
  const user = toCamelCase(result[0])
  console.log('User created successfully:', { id: user.id, username: user.username })
  return user
}

async function getUserByUsername(username) {
  const result = await query(
    'SELECT id, username, email, display_name, role, avatar_url, is_active, created_at FROM users WHERE username = $1',
    [username]
  )
  if (result.length === 0) return null
  return toCamelCase(result[0])
}

async function getUserById(id) {
  const result = await query(
    'SELECT id, username, email, display_name, role, avatar_url, is_active, created_at FROM users WHERE id = $1',
    [id]
  )
  if (result.length === 0) return null
  return toCamelCase(result[0])
}

async function authenticateUser(username, password) {
  console.log('=== authenticateUser (PostgreSQL) ===')
  console.log('Parameters:', { username, hasPassword: !!password })
  
  const result = await query(
    'SELECT id, username, email, password_hash, display_name, role, avatar_url, is_active, created_at FROM users WHERE username = $1',
    [username]
  )
  
  const user = toCamelCase(result[0])
  console.log('User found:', { id: user?.id, username: user?.username, isActive: user?.isActive })
  
  if (!user || !user.isActive) {
    console.log('Authentication failed: user not found or inactive')
    throw new Error('Invalid credentials')
  }
  
  console.log('Comparing password...')
  const isValid = await comparePassword(password, user.passwordHash)
  console.log('Password comparison result:', isValid)
  
  if (!isValid) {
    console.log('Authentication failed: invalid password')
    throw new Error('Invalid credentials')
  }
  
  const userCopy = { ...user }
  delete userCopy.passwordHash
  console.log('Authentication successful:', { id: userCopy.id, username: userCopy.username })
  return userCopy
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  createUser,
  getUserByUsername,
  getUserById,
  authenticateUser,
  validatePasswordStrength: function(password) {
    const errors = []
    
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
