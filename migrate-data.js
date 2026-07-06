const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
})

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
        `INSERT INTO "Repository" (id, name, description, "ownerId", "isPublic", "createdAt")
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, "isPublic" = EXCLUDED."isPublic"`,
        [r.id || null, r.name, r.description || null, r.ownerId || null, r.isPublic !== false, r.createdAt ? new Date(r.createdAt) : new Date()]
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
        `INSERT INTO "StoreItem" (id, title, description, price, "imageUrl", type, "createdAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, price=EXCLUDED.price, "imageUrl"=EXCLUDED."imageUrl"`,
        [it.id || null, it.title, it.description || null, it.price || 0, it.imageUrl || null, it.type || 'SERVICE', it.createdAt ? new Date(it.createdAt) : new Date()]
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
        `INSERT INTO "SupportTicket" (id, "userId", subject, message, status, "createdAt")
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET subject=EXCLUDED.subject, message=EXCLUDED.message, status=EXCLUDED.status`,
        [t.id || null, t.userId || null, t.subject || null, t.body || t.message || '', t.status || 'OPEN', t.createdAt ? new Date(t.createdAt) : new Date()]
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
        `INSERT INTO "FAQ" (id, "questionAr", "questionEn", "answerAr", "answerEn", "order", "createdAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET "questionAr"=EXCLUDED."questionAr", "answerAr"=EXCLUDED."answerAr"`,
        [parseInt(f.id) || null, f.questionAr || f.question || '', f.questionEn || '', f.answerAr || f.answer || '', f.answerEn || '', f.order || 0, f.createdAt ? new Date(f.createdAt) : new Date()]
      )
      console.log('Migrated faq:', f.id || f.questionAr)
    } catch (e) {
      console.error('FAQ migration error for', f.id || f.questionAr, e.message)
    }
  }
}

async function migrateUsers() {
  const items = readJsonIfExists('users.json')
  console.log('Users to migrate (best-effort):', items.length)
  for (const u of items) {
    try {
      if (!u.email) continue
      await query(
        `INSERT INTO "User" (id, username, email, "passwordHash", "displayName", "avatarUrl", role, "isActive", "createdAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (email) DO UPDATE SET username=EXCLUDED.username, "displayName"=EXCLUDED."displayName"`,
        [u.id || null, u.username, u.email, u.passwordHash || u.password_hash || 'placeholder', u.displayName || u.display_name || u.username, u.avatarUrl || u.avatar_url || null, u.role || 'USER', u.isActive !== false, u.createdAt ? new Date(u.createdAt) : new Date()]
      )
      console.log('Migrated user:', u.email)
    } catch (e) {
      console.error('User migration error for', u.email || u.username, e.message)
    }
  }
}

async function main() {
  try {
    console.log('Starting migration script...')
    await migrateUsers()
    await migrateRepositories()
    await migrateStoreItems()
    await migrateTickets()
    await migrateFAQs()

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
