const { verifyToken } = require('@/lib/auth-simple')
const { readDataFile, writeDataFile } = require('@/lib/data-simple')

// Input validation helpers
function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input.replace(/[<>]/g, '')
}

function validateName(name) {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' }
  }
  if (name.length > 200) {
    return { isValid: false, error: 'Name must be less than 200 characters' }
  }
  return { isValid: true }
}

function validateDescription(description) {
  if (!description || description.trim().length === 0) {
    return { isValid: false, error: 'Description is required' }
  }
  if (description.length > 10000) {
    return { isValid: false, error: 'Description must be less than 10000 characters' }
  }
  return { isValid: true }
}

export async function GET(request, { params }) {
  try {
    const items = readDataFile('store-items.json')
    const item = items.find(i => i.id === params.itemId)

    if (!item) {
      return Response.json({ error: 'Item not found' }, { status: 404 })
    }

    return Response.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    return Response.json({ error: 'Failed to fetch item' }, { status: 500 })
  }
}

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

    const users = readDataFile('users.json')
    const user = users.find(u => u.id === decoded.userId)

    if (!user || !user.isActive) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Only admins can edit items
    if (user.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const items = readDataFile('store-items.json')
    const itemIndex = items.findIndex(i => i.id === params.itemId)

    if (itemIndex === -1) {
      return Response.json({ error: 'Item not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, price, imageUrl, category, inStock } = body

    // Validate name if provided
    if (name !== undefined) {
      const nameValidation = validateName(name)
      if (!nameValidation.isValid) {
        return Response.json({ error: nameValidation.error }, { status: 400 })
      }
      items[itemIndex].name = sanitizeInput(name.trim())
    }

    // Validate description if provided
    if (description !== undefined) {
      const descriptionValidation = validateDescription(description)
      if (!descriptionValidation.isValid) {
        return Response.json({ error: descriptionValidation.error }, { status: 400 })
      }
      items[itemIndex].description = sanitizeInput(description.trim())
    }

    if (price !== undefined) {
      items[itemIndex].price = price
    }

    if (imageUrl !== undefined) {
      items[itemIndex].imageUrl = sanitizeInput(imageUrl)
    }

    if (category !== undefined) {
      items[itemIndex].category = sanitizeInput(category)
    }

    if (inStock !== undefined) {
      items[itemIndex].inStock = inStock
    }

    writeDataFile('store-items.json', items)

    return Response.json(items[itemIndex])
  } catch (error) {
    console.error('Error updating item:', error)
    return Response.json({ error: 'Failed to update item' }, { status: 500 })
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

    const users = readDataFile('users.json')
    const user = users.find(u => u.id === decoded.userId)

    if (!user || !user.isActive) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Only admins can delete items
    if (user.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const items = readDataFile('store-items.json')
    const itemIndex = items.findIndex(i => i.id === params.itemId)

    if (itemIndex === -1) {
      return Response.json({ error: 'Item not found' }, { status: 404 })
    }

    items.splice(itemIndex, 1)
    writeDataFile('store-items.json', items)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return Response.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
