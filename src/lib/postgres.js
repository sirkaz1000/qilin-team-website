const { Pool } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/qilin-team'

if (!DATABASE_URL) {
  throw new Error('Please define the DATABASE_URL environment variable')
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function connectToDatabase() {
  try {
    const client = await pool.connect()
    return client
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error)
    throw error
  }
}

async function query(text, params) {
  const client = await connectToDatabase()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

module.exports = { query, pool }
