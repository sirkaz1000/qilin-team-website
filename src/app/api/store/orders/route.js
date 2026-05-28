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

    const users = readDataFile('users.json')
    const user = users.find(u => u.id === decoded.userId)

    if (!user || !user.isActive) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const orders = readDataFile('store-orders.json')
    const items = readDataFile('store-items.json')
    
    // If admin, get all orders, otherwise get user's orders
    const filteredOrders = user.role === 'ADMIN' 
      ? orders 
      : orders.filter(o => o.userId === user.id)

    // Add item and user info to orders
    const ordersWithDetails = filteredOrders.map(order => ({
      ...order,
      item: items.find(i => i.id === order.itemId) || null,
      user: {
        username: users.find(u => u.id === order.userId)?.username || 'Unknown',
        displayName: users.find(u => u.id === order.userId)?.displayName || 'Unknown',
      },
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return Response.json(ordersWithDetails)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request) {
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

    if (!user || !user.isActive) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { itemId } = body

    if (!itemId) {
      return Response.json({ error: 'Item ID is required' }, { status: 400 })
    }

    const orders = readDataFile('store-orders.json')
    const items = readDataFile('store-items.json')
    const item = items.find(i => i.id === itemId)

    if (!item) {
      return Response.json({ error: 'Item not found' }, { status: 404 })
    }

    const newOrder = {
      id: generateId(),
      itemId: sanitizeInput(itemId),
      userId: user.id,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }
    orders.push(newOrder)
    writeDataFile('store-orders.json', orders)

    // Add item and user info to response
    const orderWithDetails = {
      ...newOrder,
      item: item,
      user: {
        username: user.username,
        displayName: user.displayName,
      },
    }

    return Response.json(orderWithDetails)
  } catch (error) {
    console.error('Error creating order:', error)
    return Response.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
