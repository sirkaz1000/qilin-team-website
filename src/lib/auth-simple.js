const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const connectToDatabase = require('./mongodb')
const User = require('../models/User')

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

async function createUser(username, email, password, displayName, role = 'USER', avatarUrl = null) {
  console.log('=== createUser (MongoDB) ===')
  console.log('Parameters:', { username, email, displayName, role, hasAvatarUrl: !!avatarUrl })
  
  await connectToDatabase()
  
  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ username }, { email }] })
  if (existingUser) {
    console.log('User already exists:', { username, email })
    throw new Error('User already exists')
  }
  
  // Hash password
  console.log('Hashing password...')
  const passwordHash = await hashPassword(password)
  console.log('Password hashed successfully')
  
  // Create user
  const newUser = new User({
    username,
    email,
    passwordHash,
    displayName,
    role,
    avatarUrl,
    isActive: true,
  })
  
  console.log('Saving user to MongoDB...')
  await newUser.save()
  console.log('User saved successfully')
  
  // Return user without password
  const userObj = newUser.toObject()
  delete userObj.passwordHash
  console.log('User created successfully:', { id: userObj._id, username: userObj.username })
  return { ...userObj, id: userObj._id.toString() }
}

async function getUserByUsername(username) {
  await connectToDatabase()
  const user = await User.findOne({ username })
  if (!user) return null
  const userObj = user.toObject()
  delete userObj.passwordHash
  return { ...userObj, id: user._id.toString() }
}

async function getUserById(id) {
  await connectToDatabase()
  const user = await User.findById(id)
  if (!user) return null
  const userObj = user.toObject()
  delete userObj.passwordHash
  return { ...userObj, id: user._id.toString() }
}

async function authenticateUser(username, password) {
  console.log('=== authenticateUser (MongoDB) ===')
  console.log('Parameters:', { username, hasPassword: !!password })
  
  await connectToDatabase()
  
  const user = await User.findOne({ username })
  console.log('User found:', { id: user?._id, username: user?.username, isActive: user?.isActive })
  
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
  
  const userObj = user.toObject()
  delete userObj.passwordHash
  console.log('Authentication successful:', { id: userObj._id, username: userObj.username })
  return { ...userObj, id: user._id.toString() }
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
