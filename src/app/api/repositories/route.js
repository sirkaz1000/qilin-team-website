const { verifyToken } = require('@/lib/auth')
const { getRepositories, createRepository } = require('@/lib/data-simple')

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

    const repositories = await getRepositories(decoded.userId)
    return Response.json(repositories)
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return Response.json({ error: 'Failed to fetch repositories' }, { status: 500 })
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
    const { name, description, isPublic } = body

    const repository = await createRepository({
      name,
      description: description || null,
      ownerId: decoded.userId,
      isPublic: isPublic !== false,
    })

    return Response.json(repository)
  } catch (error) {
    console.error('Error creating repository:', error)
    return Response.json({ error: 'Failed to create repository' }, { status: 500 })
  }
}
