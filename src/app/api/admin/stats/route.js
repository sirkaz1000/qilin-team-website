const { verifyToken } = require('@/lib/auth-simple')
const { readDataFile } = require('@/lib/data-simple')

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

    const users = readDataFile('users.json')
    const user = users.find(u => u.id === decoded.userId)

    if (!user || user.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get total users
    const totalUsers = users.length

    // Get new users in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const newUsers = users.filter(u => new Date(u.createdAt) >= sevenDaysAgo).length

    // Get total admins
    const totalAdmins = users.filter(u => u.role === 'ADMIN').length

    // Get total orders
    const orders = readDataFile('store-orders.json') || []
    const totalOrders = orders.length

    // Get total support tickets
    const tickets = readDataFile('tickets.json')
    const totalTickets = tickets.length

    return Response.json({
      totalUsers,
      newUsers,
      totalAdmins,
      totalOrders,
      totalTickets,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
