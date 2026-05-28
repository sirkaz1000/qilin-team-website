const { verifyToken } = require('@/lib/auth-simple')
const { getStoreItems, updateStoreItem, deleteStoreItem } = require('@/lib/data-simple')

export async function PATCH(request, { params }) {
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

    const item = updateStoreItem(params.id, {
      title,
      description,
      type: type || 'PRODUCT',
      price: parseFloat(price),
      imageUrl: imageUrl || null,
    })

    if (!item) {
      return Response.json({ error: 'Item not found' }, { status: 404 })
    }

    return Response.json(item)
  } catch (error) {
    console.error('Error updating store item:', error)
    return Response.json({ error: 'Failed to update store item' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
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

    const success = deleteStoreItem(params.id)

    if (!success) {
      return Response.json({ error: 'Item not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting store item:', error)
    return Response.json({ error: 'Failed to delete store item' }, { status: 500 })
  }
}
