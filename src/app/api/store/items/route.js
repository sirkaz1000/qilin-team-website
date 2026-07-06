const { verifyToken } = require('@/lib/auth')
const { getStoreItems, createStoreItem } = require('@/lib/data-simple')

export async function GET(request) {
  try {
    const items = await getStoreItems()
    return Response.json(items)
  } catch (error) {
    console.error('Error fetching store items:', error)
    return Response.json({ error: 'Failed to fetch store items' }, { status: 500 })
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

    const body = await request.json()
    const { title, description, type, price, imageUrl } = body

    const item = await createStoreItem({
      title,
      description,
      type: type || 'PRODUCT',
      price: parseFloat(price),
      imageUrl: imageUrl || null,
    })

    return Response.json(item)
  } catch (error) {
    console.error('Error creating store item:', error)
    return Response.json({ error: 'Failed to create store item' }, { status: 500 })
  }
}
