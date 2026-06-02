const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || '497b4464ab148e30db01414cd960d065c696453caca9ecfd5ce64fa8ec78a4bd'

// In-memory storage
let users = []

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

async function createUser(username, email, password, displayName, role = 'USER', avatarUrl = null) {
  console.log('=== createUser (In-memory) ===')
  console.log('Parameters:', { username, email, displayName, role, hasAvatarUrl: !!avatarUrl })
  
  // Check if user already exists
  const existingUser = users.find(u => u.username === username || u.email === email)
  if (existingUser) {
    console.log('User already exists:', { username, email })
    throw new Error('User already exists')
  }
  
  // Hash password
  console.log('Hashing password...')
  const passwordHash = await hashPassword(password)
  console.log('Password hashed successfully')
  
  // Create user
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    passwordHash,
    displayName,
    role,
    avatarUrl,
    isActive: true,
    createdAt: new Date()
  }
  
  console.log('Saving user to memory...')
  users.push(newUser)
  console.log('User saved successfully')
  
  // Return user without password
  const user = { ...newUser }
  delete user.passwordHash
  console.log('User created successfully:', { id: user.id, username: user.username })
  return user
}

async function getUserByUsername(username) {
  const user = users.find(u => u.username === username)
  if (!user) return null
  const userCopy = { ...user }
  delete userCopy.passwordHash
  return userCopy
}

async function getUserById(id) {
  const user = users.find(u => u.id === id)
  if (!user) return null
  const userCopy = { ...user }
  delete userCopy.passwordHash
  return userCopy
}

async function authenticateUser(username, password) {
  console.log('=== authenticateUser (In-memory) ===')
  console.log('Parameters:', { username, hasPassword: !!password })
  
  const user = users.find(u => u.username === username)
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
