const { query } = require('./postgres')

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

// Posts functions
async function getPosts() {
  const result = await query(
    'SELECT * FROM "Post" ORDER BY "isPinned" DESC, "createdAt" DESC'
  )
  return result.map(post => toCamelCase(post))
}

async function createPost(postData) {
  const { title, content, authorId, isPinned } = postData
  const result = await query(
    `INSERT INTO "Post" (id, title, content, "authorId", "isPinned", "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [generateId(), title, content, authorId, isPinned || false, new Date()]
  )
  return toCamelCase(result[0])
}

// Achievements functions
async function getAchievements() {
  const result = await query(
    'SELECT * FROM "Achievement" ORDER BY "createdAt" DESC'
  )
  return result.map(achievement => toCamelCase(achievement))
}

async function createAchievement(achievementData) {
  const { title, description, iconUrl, isFeatured, authorId } = achievementData
  const result = await query(
    `INSERT INTO "Achievement" (id, title, description, "iconUrl", "isFeatured", "authorId", "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [generateId(), title, description, iconUrl, isFeatured || false, authorId, new Date()]
  )
  return toCamelCase(result[0])
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
  generateId,
  toCamelCase,
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
