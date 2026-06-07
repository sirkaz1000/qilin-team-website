const fs = require('fs')
const path = require('path')

// In-memory storage
let posts = []
let achievements = []

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
  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(post => ({
    ...post,
    id: post.id.toString()
  }))
}

async function createPost(postData) {
  const { title, content, authorId, username, displayName, imageUrl, videoUrl, isPinned } = postData
  const newPost = {
    id: Date.now().toString(),
    title,
    content,
    authorId,
    username,
    displayName,
    imageUrl,
    videoUrl,
    isPinned: isPinned || false,
    createdAt: new Date()
  }
  posts.push(newPost)
  return {
    ...newPost,
    id: newPost.id.toString()
  }
}

// Achievements functions
async function getAchievements() {
  return achievements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(achievement => ({
    ...achievement,
    id: achievement.id.toString()
  }))
}

async function createAchievement(achievementData) {
  const { title, description, iconUrl, imageUrl, videoUrl, isFeatured, authorId } = achievementData
  const newAchievement = {
    id: Date.now().toString(),
    title,
    description,
    iconUrl,
    imageUrl,
    videoUrl,
    isFeatured: isFeatured || false,
    authorId,
    createdAt: new Date()
  }
  achievements.push(newAchievement)
  return {
    ...newAchievement,
    id: newAchievement.id.toString()
  }
}

// Repositories functions (placeholder - using JSON for now)
function getRepositories() {
  const fs = require('fs')
  const path = require('path')
  try {
    const filePath = path.join(process.cwd(), 'data', 'repositories.json')
    if (!fs.existsSync(filePath)) {
      return []
    }
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading repositories.json:`, error)
    return []
  }
}

function createRepository(repoData) {
  const fs = require('fs')
  const path = require('path')
  try {
    const repositories = getRepositories()
    const newRepo = {
      id: generateId(),
      ...repoData,
      createdAt: new Date().toISOString()
    }
    repositories.push(newRepo)
    const filePath = path.join(process.cwd(), 'data', 'repositories.json')
    fs.writeFileSync(filePath, JSON.stringify(repositories, null, 2))
    return newRepo
  } catch (error) {
    console.error(`Error writing repositories.json:`, error)
    return null
  }
}

// Store items functions (placeholder - using JSON for now)
function getStoreItems() {
  const fs = require('fs')
  const path = require('path')
  try {
    const filePath = path.join(process.cwd(), 'data', 'store-items.json')
    if (!fs.existsSync(filePath)) {
      return []
    }
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading store-items.json:`, error)
    return []
  }
}

function createStoreItem(itemData) {
  const fs = require('fs')
  const path = require('path')
  try {
    const items = getStoreItems()
    const newItem = {
      id: generateId(),
      ...itemData,
      createdAt: new Date().toISOString(),
      reviews: []
    }
    items.push(newItem)
    const filePath = path.join(process.cwd(), 'data', 'store-items.json')
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2))
    return newItem
  } catch (error) {
    console.error(`Error writing store-items.json:`, error)
    return null
  }
}

function updateStoreItem(id, itemData) {
  const fs = require('fs')
  const path = require('path')
  try {
    const items = getStoreItems()
    const index = items.findIndex(item => item.id === id)
    if (index === -1) {
      return null
    }
    items[index] = {
      ...items[index],
      ...itemData,
      updatedAt: new Date().toISOString()
    }
    const filePath = path.join(process.cwd(), 'data', 'store-items.json')
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2))
    return items[index]
  } catch (error) {
    console.error(`Error writing store-items.json:`, error)
    return null
  }
}

function deleteStoreItem(id) {
  const fs = require('fs')
  const path = require('path')
  try {
    const items = getStoreItems()
    const index = items.findIndex(item => item.id === id)
    if (index === -1) {
      return false
    }
    items.splice(index, 1)
    const filePath = path.join(process.cwd(), 'data', 'store-items.json')
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2))
    return true
  } catch (error) {
    console.error(`Error writing store-items.json:`, error)
    return false
  }
}

// Tickets functions (placeholder - using JSON for now)
function getTickets() {
  const fs = require('fs')
  const path = require('path')
  try {
    const filePath = path.join(process.cwd(), 'data', 'tickets.json')
    if (!fs.existsSync(filePath)) {
      return []
    }
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading tickets.json:`, error)
    return []
  }
}

function createTicket(ticketData) {
  const fs = require('fs')
  const path = require('path')
  try {
    const tickets = getTickets()
    const newTicket = {
      id: generateId(),
      ...ticketData,
      createdAt: new Date().toISOString(),
      status: 'OPEN'
    }
    tickets.push(newTicket)
    const filePath = path.join(process.cwd(), 'data', 'tickets.json')
    fs.writeFileSync(filePath, JSON.stringify(tickets, null, 2))
    return newTicket
  } catch (error) {
    console.error(`Error writing tickets.json:`, error)
    return null
  }
}

// FAQ functions (placeholder - using JSON for now)
function getFAQs() {
  const fs = require('fs')
  const path = require('path')
  try {
    const filePath = path.join(process.cwd(), 'data', 'faq.json')
    if (!fs.existsSync(filePath)) {
      return []
    }
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading faq.json:`, error)
    return []
  }
}

function createFAQ(faqData) {
  const fs = require('fs')
  const path = require('path')
  try {
    const faqs = getFAQs()
    const newFAQ = {
      id: generateId(),
      ...faqData,
      createdAt: new Date().toISOString()
    }
    faqs.push(newFAQ)
    const filePath = path.join(process.cwd(), 'data', 'faq.json')
    fs.writeFileSync(filePath, JSON.stringify(faqs, null, 2))
    return newFAQ
  } catch (error) {
    console.error(`Error writing faq.json:`, error)
    return null
  }
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
