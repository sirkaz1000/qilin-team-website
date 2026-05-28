const fs = require('fs')
const path = require('path')

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

// Helper function to generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Posts functions
function getPosts() {
  const posts = readDataFile('posts.json')
  const users = readDataFile('users.json')
  return posts.map(post => ({
    ...post,
    author: users.find(u => u.id === post.authorId) || { id: post.authorId, username: 'Unknown', displayName: 'Unknown' },
    comments: post.comments || []
  }))
}

function createPost(postData) {
  const posts = readDataFile('posts.json')
  const newPost = {
    id: generateId(),
    ...postData,
    createdAt: new Date().toISOString(),
    comments: []
  }
  posts.push(newPost)
  writeDataFile('posts.json', posts)
  return newPost
}

// Achievements functions
function getAchievements() {
  return readDataFile('achievements.json')
}

function createAchievement(achievementData) {
  const achievements = readDataFile('achievements.json')
  const newAchievement = {
    id: generateId(),
    ...achievementData,
    createdAt: new Date().toISOString()
  }
  achievements.push(newAchievement)
  writeDataFile('achievements.json', achievements)
  return newAchievement
}

// Repositories functions
function getRepositories() {
  return readDataFile('repositories.json')
}

function createRepository(repoData) {
  const repositories = readDataFile('repositories.json')
  const newRepo = {
    id: generateId(),
    ...repoData,
    createdAt: new Date().toISOString()
  }
  repositories.push(newRepo)
  writeDataFile('repositories.json', repositories)
  return newRepo
}

// Store items functions
function getStoreItems() {
  return readDataFile('store-items.json')
}

function createStoreItem(itemData) {
  const items = readDataFile('store-items.json')
  const newItem = {
    id: generateId(),
    ...itemData,
    createdAt: new Date().toISOString(),
    reviews: []
  }
  items.push(newItem)
  writeDataFile('store-items.json', items)
  return newItem
}

function updateStoreItem(id, itemData) {
  const items = readDataFile('store-items.json')
  const index = items.findIndex(item => item.id === id)
  if (index === -1) {
    return null
  }
  items[index] = {
    ...items[index],
    ...itemData,
    updatedAt: new Date().toISOString()
  }
  writeDataFile('store-items.json', items)
  return items[index]
}

function deleteStoreItem(id) {
  const items = readDataFile('store-items.json')
  const index = items.findIndex(item => item.id === id)
  if (index === -1) {
    return false
  }
  items.splice(index, 1)
  writeDataFile('store-items.json', items)
  return true
}

// Tickets functions
function getTickets() {
  return readDataFile('tickets.json')
}

function createTicket(ticketData) {
  const tickets = readDataFile('tickets.json')
  const newTicket = {
    id: generateId(),
    ...ticketData,
    createdAt: new Date().toISOString(),
    status: 'OPEN'
  }
  tickets.push(newTicket)
  writeDataFile('tickets.json', tickets)
  return newTicket
}

// FAQ functions
function getFAQs() {
  return readDataFile('faq.json')
}

function createFAQ(faqData) {
  const faqs = readDataFile('faq.json')
  const newFAQ = {
    id: generateId(),
    ...faqData,
    createdAt: new Date().toISOString()
  }
  faqs.push(newFAQ)
  writeDataFile('faq.json', faqs)
  return newFAQ
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
