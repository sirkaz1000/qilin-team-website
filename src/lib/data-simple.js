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
async function getRepositories() {
  const result = await query(
    'SELECT * FROM repositories ORDER BY created_at DESC'
  )
  return result.map(repo => toCamelCase({
    ...repo,
    id: repo.id.toString()
  }))
}

async function createRepository(repoData) {
  const { name, description, url, isPublic, stars, forks, language } = repoData
  const id = generateId()
  const result = await query(
    `INSERT INTO repositories (id, name, description, url, is_public, stars, forks, language, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [id, name, description, url, isPublic !== undefined ? isPublic : true, stars || 0, forks || 0, language || null, new Date(), new Date()]
  )
  return toCamelCase({
    ...result[0],
    id: result[0].id.toString()
  })
}

// Store items functions
async function getStoreItems() {
  const result = await query(
    'SELECT * FROM store_items ORDER BY created_at DESC'
  )
  return result.map(item => toCamelCase({
    ...item,
    id: item.id.toString()
  }))
}

async function createStoreItem(itemData) {
  const { title, description, price, imageUrl, videoUrl, category, isDigital, isAvailable } = itemData
  const id = generateId()
  const result = await query(
    `INSERT INTO store_items (id, title, description, price, image_url, video_url, category, is_digital, is_available, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [id, title, description, price, imageUrl || null, videoUrl || null, category || null, isDigital !== undefined ? isDigital : true, isAvailable !== undefined ? isAvailable : true, new Date(), new Date()]
  )
  return toCamelCase({
    ...result[0],
    id: result[0].id.toString()
  })
}

async function updateStoreItem(id, itemData) {
  const { title, description, price, imageUrl, videoUrl, category, isDigital, isAvailable } = itemData
  const updates = []
  const values = []
  let paramIndex = 1

  if (title !== undefined) {
    updates.push(`title = $${paramIndex}`)
    values.push(title)
    paramIndex++
  }
  if (description !== undefined) {
    updates.push(`description = $${paramIndex}`)
    values.push(description)
    paramIndex++
  }
  if (price !== undefined) {
    updates.push(`price = $${paramIndex}`)
    values.push(price)
    paramIndex++
  }
  if (imageUrl !== undefined) {
    updates.push(`image_url = $${paramIndex}`)
    values.push(imageUrl)
    paramIndex++
  }
  if (videoUrl !== undefined) {
    updates.push(`video_url = $${paramIndex}`)
    values.push(videoUrl)
    paramIndex++
  }
  if (category !== undefined) {
    updates.push(`category = $${paramIndex}`)
    values.push(category)
    paramIndex++
  }
  if (isDigital !== undefined) {
    updates.push(`is_digital = $${paramIndex}`)
    values.push(isDigital)
    paramIndex++
  }
  if (isAvailable !== undefined) {
    updates.push(`is_available = $${paramIndex}`)
    values.push(isAvailable)
    paramIndex++
  }

  updates.push(`updated_at = $${paramIndex}`)
  values.push(new Date())
  paramIndex++

  values.push(id)

  const result = await query(
    `UPDATE store_items SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  )

  if (result.length === 0) return null

  return toCamelCase({
    ...result[0],
    id: result[0].id.toString()
  })
}

async function deleteStoreItem(id) {
  const result = await query(
    'DELETE FROM store_items WHERE id = $1 RETURNING id',
    [id]
  )
  return result.length > 0
}

// Tickets functions
async function getTickets() {
  const result = await query(
    'SELECT * FROM tickets ORDER BY created_at DESC'
  )
  return result.map(ticket => toCamelCase({
    ...ticket,
    id: ticket.id.toString()
  }))
}

async function createTicket(ticketData) {
  const { userId, subject, description, status, priority } = ticketData
  const id = generateId()
  const result = await query(
    `INSERT INTO tickets (id, user_id, subject, description, status, priority, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [id, userId, subject, description || null, status || 'OPEN', priority || 'MEDIUM', new Date(), new Date()]
  )
  return toCamelCase({
    ...result[0],
    id: result[0].id.toString()
  })
}

// FAQ functions
async function getFAQs() {
  const result = await query(
    'SELECT * FROM faq WHERE is_active = true ORDER BY created_at DESC'
  )
  return result.map(faq => toCamelCase({
    ...faq,
    id: faq.id.toString()
  }))
}

async function createFAQ(faqData) {
  const { question, answer, category, isActive } = faqData
  const id = generateId()
  const result = await query(
    `INSERT INTO faq (id, question, answer, category, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [id, question, answer, category || null, isActive !== undefined ? isActive : true, new Date(), new Date()]
  )
  return toCamelCase({
    ...result[0],
    id: result[0].id.toString()
  })
}

module.exports = {
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
