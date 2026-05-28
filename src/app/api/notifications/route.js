const { verifyToken } = require('@/lib/auth-simple')
const { readDataFile, writeDataFile, generateId } = require('@/lib/data-simple')

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

    const notifications = readDataFile('notifications.json')
    const userNotifications = notifications
      .filter(n => n.userId === decoded.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50)

    return Response.json(userNotifications)
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

    const notifications = readDataFile('notifications.json')
    const notificationIndex = notifications.findIndex(
      n => n.id === sanitizeInput(notificationId) && n.userId === decoded.userId
    )

    if (notificationIndex === -1) {
      return Response.json({ error: 'Notification not found' }, { status: 404 })
    }

    notifications[notificationIndex].isRead = isRead !== undefined ? isRead : true
    writeDataFile('notifications.json', notifications)

    return Response.json(notifications[notificationIndex])
  } catch (error) {
    console.error('Error updating notification:', error)
    return Response.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
