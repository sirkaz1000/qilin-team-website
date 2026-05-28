const { verifyToken } = require('@/lib/auth-simple')
const { readDataFile, writeDataFile, generateId } = require('@/lib/data-simple')

// Input validation helpers
function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input.replace(/[<>]/g, '')
}

function validateContactMethod(method) {
  const validMethods = ['phone', 'email', 'discord', 'telegram', 'whatsapp', 'other']
  if (!method || !validMethods.includes(method)) {
    return { isValid: false, error: 'Invalid contact method' }
  }
  return { isValid: true }
}

function validateContactInfo(info) {
  if (!info || info.trim().length === 0) {
    return { isValid: false, error: 'Contact information is required' }
  }
  if (info.length > 500) {
    return { isValid: false, error: 'Contact information must be less than 500 characters' }
  }
  return { isValid: true }
}

function validateDetails(details) {
  if (!details || details.trim().length === 0) {
    return { isValid: false, error: 'Request details are required' }
  }
  if (details.length > 5000) {
    return { isValid: false, error: 'Request details must be less than 5000 characters' }
  }
  return { isValid: true }
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

    const requests = readDataFile('store-requests.json')
    
    // If admin, get all requests, otherwise get user's requests
    const filteredRequests = user.role === 'ADMIN' 
      ? requests 
      : requests.filter(r => r.userId === user.id)

    // Add user info to requests
    const requestsWithUserInfo = filteredRequests.map(request => ({
      ...request,
      user: {
        username: users.find(u => u.id === request.userId)?.username || 'Unknown',
        displayName: users.find(u => u.id === request.userId)?.displayName || 'Unknown'
      }
    }))

    return Response.json(requestsWithUserInfo)
  } catch (error) {
    console.error('Error fetching requests:', error)
    return Response.json({ error: 'Failed to fetch requests' }, { status: 500 })
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
    const { itemType, itemName, contactMethod, contactInfo, details } = body

    // Validate contact method
    const contactMethodValidation = validateContactMethod(contactMethod)
    if (!contactMethodValidation.isValid) {
      return Response.json({ error: contactMethodValidation.error }, { status: 400 })
    }

    // Validate contact info
    const contactInfoValidation = validateContactInfo(contactInfo)
    if (!contactInfoValidation.isValid) {
      return Response.json({ error: contactInfoValidation.error }, { status: 400 })
    }

    // Validate details
    const detailsValidation = validateDetails(details)
    if (!detailsValidation.isValid) {
      return Response.json({ error: detailsValidation.error }, { status: 400 })
    }

    const requests = readDataFile('store-requests.json')
    const newRequest = {
      id: generateId(),
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      itemType: sanitizeInput(itemType),
      itemName: sanitizeInput(itemName),
      contactMethod: sanitizeInput(contactMethod),
      contactInfo: sanitizeInput(contactInfo.trim()),
      details: sanitizeInput(details.trim()),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }
    requests.push(newRequest)
    writeDataFile('store-requests.json', requests)

    return Response.json(newRequest)
  } catch (error) {
    console.error('Error creating request:', error)
    return Response.json({ error: 'Failed to create request' }, { status: 500 })
  }
}
