const { verifyToken } = require('@/lib/auth-simple')
const { readDataFile, writeDataFile, generateId } = require('@/lib/data-simple')

// Input validation helpers
function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input.replace(/[<>]/g, '')
}

function validateSubject(subject) {
  if (!subject || subject.trim().length === 0) {
    return { isValid: false, error: 'Subject is required' }
  }
  if (subject.length > 200) {
    return { isValid: false, error: 'Subject must be less than 200 characters' }
  }
  return { isValid: true }
}

function validateMessage(message) {
  if (!message || message.trim().length === 0) {
    return { isValid: false, error: 'Message is required' }
  }
  if (message.length > 5000) {
    return { isValid: false, error: 'Message must be less than 5000 characters' }
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

    const tickets = readDataFile('tickets.json')
    
    // If admin, get all tickets, otherwise get user's tickets
    const filteredTickets = user.role === 'ADMIN' 
      ? tickets 
      : tickets.filter(t => t.userId === user.id)

    // Add user info to tickets
    const ticketsWithUserInfo = filteredTickets.map(ticket => ({
      ...ticket,
      user: {
        username: users.find(u => u.id === ticket.userId)?.username || 'Unknown',
        displayName: users.find(u => u.id === ticket.userId)?.displayName || 'Unknown'
      }
    }))

    return Response.json(ticketsWithUserInfo)
  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return Response.json({ error: 'Failed to fetch tickets' }, { status: 500 })
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
    const { subject, message } = body

    // Validate subject
    const subjectValidation = validateSubject(subject)
    if (!subjectValidation.isValid) {
      return Response.json({ error: subjectValidation.error }, { status: 400 })
    }

    // Validate message
    const messageValidation = validateMessage(message)
    if (!messageValidation.isValid) {
      return Response.json({ error: messageValidation.error }, { status: 400 })
    }

    const tickets = readDataFile('tickets.json')
    const newTicket = {
      id: generateId(),
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      subject: sanitizeInput(subject.trim()),
      message: sanitizeInput(message.trim()),
      status: 'OPEN',
      createdAt: new Date().toISOString()
    }
    tickets.push(newTicket)
    writeDataFile('tickets.json', tickets)

    return Response.json(newTicket)
  } catch (error) {
    console.error('Error creating support ticket:', error)
    return Response.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
