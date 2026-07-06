const { verifyToken } = require('@/lib/auth')
const { getUserById } = require('@/lib/auth-simple')
const { query } = require('@/lib/postgres')

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

    const user = await getUserById(decoded.userId)

    if (!user || user.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get total users
    const usersResult = await query('SELECT COUNT(*)::int as count FROM "User"')
    const totalUsers = usersResult[0].count

    // Get new users in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const newUsersResult = await query('SELECT COUNT(*)::int as count FROM "User" WHERE "createdAt" >= $1', [sevenDaysAgo])
    const newUsers = newUsersResult[0].count

    // Get total admins
    const adminsResult = await query('SELECT COUNT(*)::int as count FROM "User" WHERE role = \'ADMIN\' AND "isActive" = true')
    const totalAdmins = adminsResult[0].count

    // Get total orders
    const ordersResult = await query('SELECT COUNT(*)::int as count FROM "StoreOrder"')
    const totalOrders = ordersResult[0].count

    // Get total support tickets
    const ticketsResult = await query('SELECT COUNT(*)::int as count FROM "SupportTicket"')
    const totalTickets = ticketsResult[0].count

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
