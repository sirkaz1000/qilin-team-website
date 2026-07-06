const { verifyToken } = require('@/lib/auth')
const { query } = require('@/lib/postgres')
const { toCamelCase } = require('@/lib/data-simple')

// Input validation helpers
function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input.replace(/[<>]/g, '')
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }

    const result = await query(
      'SELECT * FROM "Notification" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 50',
      [decoded.userId]
    )

    return Response.json(result.map(n => toCamelCase(n)))
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return Response.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, isRead } = body

    if (!notificationId) {
      return Response.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    const result = await query(
      'UPDATE "Notification" SET "isRead" = $1 WHERE id = $2 AND "userId" = $3 RETURNING *',
      [isRead !== undefined ? isRead : true, notificationId, decoded.userId]
    )

    if (result.length === 0) {
      return Response.json({ error: 'Notification not found' }, { status: 404 })
    }

    return Response.json(toCamelCase(result[0]))
  } catch (error) {
    console.error('Error updating notification:', error)
    return Response.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
