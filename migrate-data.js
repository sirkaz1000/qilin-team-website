const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function query(text, params) {
  const res = await pool.query(text, params)
  return res.rows
}

function readJsonIfExists(filename) {
  const p = path.join(process.cwd(), 'data', filename)
  if (!fs.existsSync(p)) return []
  try {
    const raw = fs.readFileSync(p, 'utf8')
    return JSON.parse(raw || '[]')
  } catch (e) {
    console.error('Failed to parse', filename, e)
    return []
  }
}

async function migrateRepositories() {
  const items = readJsonIfExists('repositories.json')
  console.log('Repositories to migrate:', items.length)
  for (const r of items) {
    try {
      await query(
        `INSERT INTO repositories (id, name, description, owner_id, private, created_at)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, private = EXCLUDED.private`,
        [r.id || null, r.name, r.description || null, r.ownerId || null, r.isPublic === true ? false : true, r.createdAt ? new Date(r.createdAt) : new Date()]
      )
      console.log('Migrated repo:', r.id || r.name)
    } catch (e) {
      console.error('Repo migration error for', r.id || r.name, e.message)
    }
  }
}

async function migrateStoreItems() {
  const items = readJsonIfExists('store-items.json')
  console.log('Store items to migrate:', items.length)
  for (const it of items) {
    try {
      await query(
        `INSERT INTO store_items (id, title, description, price, author_id, username, display_name, image_url, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, price=EXCLUDED.price, image_url=EXCLUDED.image_url`,
        [it.id || null, it.title, it.description || null, it.price || null, it.authorId || null, it.username || null, it.displayName || null, it.imageUrl || null, it.createdAt ? new Date(it.createdAt) : new Date()]
      )
      console.log('Migrated store item:', it.id || it.title)
    } catch (e) {
      console.error('Store item migration error for', it.id || it.title, e.message)
    }
  }
}

async function migrateTickets() {
  const items = readJsonIfExists('tickets.json')
  console.log('Tickets to migrate:', items.length)
  for (const t of items) {
    try {
      await query(
        `INSERT INTO tickets (id, user_id, subject, body, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET subject=EXCLUDED.subject, body=EXCLUDED.body, status=EXCLUDED.status`,
        [t.id || null, t.userId || null, t.subject || null, t.body || null, t.status || 'OPEN', t.createdAt ? new Date(t.createdAt) : new Date()]
      )
      console.log('Migrated ticket:', t.id || t.subject)
    } catch (e) {
      console.error('Ticket migration error for', t.id || t.subject, e.message)
    }
  }
}

async function migrateFAQs() {
  const items = readJsonIfExists('faq.json')
  console.log('FAQs to migrate:', items.length)
  for (const f of items) {
    try {
      await query(
        `INSERT INTO faqs (id, question, answer, created_at)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (id) DO UPDATE SET question=EXCLUDED.question, answer=EXCLUDED.answer`,
        [f.id || null, f.question || null, f.answer || null, f.createdAt ? new Date(f.createdAt) : new Date()]
      )
      console.log('Migrated faq:', f.id || f.question)
    } catch (e) {
      console.error('FAQ migration error for', f.id || f.question, e.message)
    }
  }
}

async function migrateUsers() {
  const items = readJsonIfExists('users.json')
  console.log('Users to migrate (best-effort):', items.length)
  for (const u of items) {
    try {
      // Upsert by email if exists, else insert
      if (!u.email) {
        console.log('Skipping user without email', u.username)
        continue
      }
      await query(
        `INSERT INTO users (username, email, display_name, avatar_url, role, is_active, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (email) DO UPDATE SET username=EXCLUDED.username, display_name=EXCLUDED.display_name, avatar_url=COALESCE(users.avatar_url, EXCLUDED.avatar_url)`,
        [u.username || null, u.email, u.displayName || u.display_name || null, u.avatarUrl || u.avatar_url || null, u.role || 'USER', u.isActive === undefined ? true : u.isActive, u.createdAt ? new Date(u.createdAt) : new Date()]
      )
      console.log('Migrated user:', u.email)
    } catch (e) {
      console.error('User migration error for', u.email || u.username, e.message)
    }
  }
}

async function migrateImagesFromDataURLs() {
  // Some uploads may have been stored as data URLs in JSON for posts/achievements; we will not store binary in DB but store the data URL as image url
  // Check posts and achievements JSON if present
  const posts = readJsonIfExists('posts.json')
  console.log('Posts to inspect for data URLs:', posts.length)
  let count = 0
  for (const p of posts) {
    if (p.imageUrl && String(p.imageUrl).startsWith('data:')) {
      try {
        await query(`INSERT INTO images (owner_id, filename, url, provider, mime_type, size, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [p.authorId || null, null, p.imageUrl, 'inline', null, null, p.createdAt ? new Date(p.createdAt) : new Date()])
        count++
      } catch (e) {
        console.warn('Failed to store inline image for post', p.id, e.message)
      }
    }
  }
  console.log('Stored inline images from posts:', count)
}

async function main() {
  try {
    console.log('Starting migration script...')
    await migrateRepositories()
    await migrateStoreItems()
    await migrateTickets()
    await migrateFAQs()
    await migrateUsers()
    await migrateImagesFromDataURLs()

    console.log('Migration finished successfully')
    process.exit(0)
  } catch (e) {
    console.error('Migration failed', e)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
