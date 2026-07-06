const { query } = require('./postgres')
const fs = require('fs')
const path = require('path')

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

// Helper function to generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Helper function to read JSON file
function readDataFile(filename) {
  try {
    const filePath = path.join(process.cwd(), 'data', filename)
    if (!fs.existsSync(filePath)) {
      return []
    }
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    return []
  }
}

// Helper function to write JSON file
function writeDataFile(filename, data) {
  try {
    const filePath = path.join(process.cwd(), 'data', filename)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
    return false
  }
}

// Posts functions
async function getPosts() {
  const result = await query(
    'SELECT * FROM posts ORDER BY created_at DESC'
  )
  return result.map(post => toCamelCase({
    ...post,
    id: post.id.toString()
  }))
}

async function createPost(postData) {
  const { title, content, authorId, username, displayName, imageUrl, videoUrl, isPinned } = postData
  const result = await query(
    `INSERT INTO posts (title, content, author_id, username, display_name, image_url, video_url, is_pinned, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [title, content, authorId, username, displayName, imageUrl, videoUrl, isPinned || false, new Date()]
  )
  return toCamelCase({
    ...result[0],
    id: result[0].id.toString()
  })
}

// Achievements functions
async function getAchievements() {
  const result = await query(
    'SELECT * FROM achievements ORDER BY created_at DESC'
  )
  return result.map(achievement => toCamelCase({
    ...achievement,
    id: achievement.id.toString()
  }))
}

async function createAchievement(achievementData) {
  const { title, description, iconUrl, imageUrl, videoUrl, isFeatured, authorId } = achievementData
  const result = await query(
    `INSERT INTO achievements (title, description, icon_url, image_url, video_url, is_featured, author_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [title, description, iconUrl, imageUrl, videoUrl, isFeatured || false, authorId, new Date()]
  )
  return toCamelCase({
    ...result[0],
    id: result[0].id.toString()
  })
}

// Repositories functions
async function getRepositories(ownerId) {
  const sql = ownerId 
    ? 'SELECT * FROM "Repository" WHERE "ownerId" = $1 ORDER BY "createdAt" DESC'
    : 'SELECT * FROM "Repository" ORDER BY "createdAt" DESC'
  const params = ownerId ? [ownerId] : []
  const result = await query(sql, params)
  return result.map(r => toCamelCase(r))
}

async function createRepository(repoData) {
  const { name, description, ownerId, isPublic } = repoData
  const result = await query(
    `INSERT INTO "Repository" (id, name, description, "ownerId", "isPublic", "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [generateId(), name, description, ownerId, isPublic !== false, new Date()]
  )
  return toCamelCase(result[0])
}

// Store items functions
async function getStoreItems() {
  const result = await query('SELECT * FROM "StoreItem" ORDER BY "createdAt" DESC')
  return result.map(item => toCamelCase(item))
}

async function createStoreItem(itemData) {
  const { title, description, price, imageUrl, type } = itemData
  const result = await query(
    `INSERT INTO "StoreItem" (id, title, description, price, "imageUrl", type, "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [generateId(), title, description, price || 0, imageUrl, type || 'SERVICE', new Date()]
  )
  return toCamelCase(result[0])
}

async function updateStoreItem(id, itemData) {
  const fields = []
  const values = []
  let idx = 1
  for (const key in itemData) {
    const dbKey = key === 'imageUrl' ? '"imageUrl"' : key
    fields.push(`${dbKey}=$${idx++}`)
    values.push(itemData[key])
  }
  values.push(id)
  const result = await query(
    `UPDATE "StoreItem" SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  )
  return result.length > 0 ? toCamelCase(result[0]) : null
}

async function deleteStoreItem(id) {
  const result = await query('DELETE FROM "StoreItem" WHERE id = $1', [id])
  return true
}

// Tickets functions
async function getTickets(userId) {
  const sql = userId 
    ? 'SELECT * FROM "SupportTicket" WHERE "userId" = $1 ORDER BY "createdAt" DESC'
    : 'SELECT * FROM "SupportTicket" ORDER BY "createdAt" DESC'
  const params = userId ? [userId] : []
  const result = await query(sql, params)
  return result.map(t => toCamelCase(t))
}

async function createTicket(ticketData) {
  const { userId, subject, message } = ticketData
  const result = await query(
    `INSERT INTO "SupportTicket" (id, "userId", subject, message, status, "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [generateId(), userId, subject, message, 'OPEN', new Date()]
  )
  return toCamelCase(result[0])
}

// FAQ functions
async function getFAQs() {
  const result = await query('SELECT * FROM "FAQ" ORDER BY "order" ASC, "createdAt" DESC')
  return result.map(f => toCamelCase(f))
}

async function createFAQ(faqData) {
  const { questionAr, questionEn, answerAr, answerEn, order } = faqData
  const result = await query(
    `INSERT INTO "FAQ" ("questionAr", "questionEn", "answerAr", "answerEn", "order", "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [questionAr, questionEn, answerAr, answerEn, order || 0, new Date()]
  )
  return toCamelCase(result[0])
}

module.exports = {
  readDataFile,
  writeDataFile,
  generateId,
  getPosts,
  createPost,
  getAchievements,
  createAchievement,
  getRepositories,
  createRepository,
  getStoreItems,
  createStoreItem,
  updateStoreItem,
  deleteStoreItem,
  getTickets,
  createTicket,
  getFAQs,
  createFAQ
}
