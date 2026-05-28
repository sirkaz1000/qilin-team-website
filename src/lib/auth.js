const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// JWT_SECRET is required - fail fast if not set
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

// Generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { 
    expiresIn: '7d',
    algorithm: 'HS256'
  })
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Hash password with increased rounds for better security
async function hashPassword(password) {
  // Validate password strength
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }
  return await bcrypt.hash(password, 12)
}

// Compare password
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

// Validate password strength
function validatePasswordStrength(password) {
  const errors = []
  
  if (!password || password.length < 8) {
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
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  validatePasswordStrength,
}
