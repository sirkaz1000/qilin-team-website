const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')
const JWT_SECRET = process.env.JWT_SECRET || '497b4464ab148e30db01414cd960d065c696453caca9ecfd5ce64fa8ec78a4bd'

// Ensure users file exists
if (!fs.existsSync(path.dirname(USERS_FILE))) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true })
}

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2))
}

// Helper functions
function getUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

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

async function createUser(username, email, password, displayName, role = 'USER') {
  const users = getUsers()
  
  // Check if user already exists
  if (users.find(u => u.username === username || u.email === email)) {
    throw new Error('User already exists')
  }
  
  // Hash password
  const passwordHash = await hashPassword(password)
  
  // Create user
  const newUser = {
    id: crypto.randomUUID(),
    username,
    email,
    passwordHash,
    displayName,
    role,
    isActive: true,
    createdAt: new Date().toISOString(),
  }
  
  users.push(newUser)
  saveUsers(users)
  
  // Return user without password
  const { passwordHash: _, ...userWithoutPassword } = newUser
  return userWithoutPassword
}

async function getUserByUsername(username) {
  const users = getUsers()
  const user = users.find(u => u.username === username)
  return user
}

async function getUserById(id) {
  const users = getUsers()
  const user = users.find(u => u.id === id)
  return user
}

async function authenticateUser(username, password) {
  const user = await getUserByUsername(username)
  
  if (!user || !user.isActive) {
    throw new Error('Invalid credentials')
  }
  
  const isValid = await comparePassword(password, user.passwordHash)
  
  if (!isValid) {
    throw new Error('Invalid credentials')
  }
  
  const { passwordHash: _, ...userWithoutPassword } = user
  return userWithoutPassword
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
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
