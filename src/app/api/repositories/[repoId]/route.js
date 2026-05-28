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
  if (description && description.length > 10000) {
    return { isValid: false, error: 'Description must be less than 10000 characters' }
  }
  return { isValid: true }
}

export async function GET(request, { params }) {
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

    const repositories = readDataFile('repositories.json')
    const users = readDataFile('users.json')
    
    const repository = repositories.find(r => 
      r.id === params.repoId && 
      (r.ownerId === decoded.userId || r.isPublic)
    )

    if (!repository) {
      return Response.json({ error: 'Repository not found' }, { status: 404 })
    }

    // Add owner info
    const repositoryWithOwner = {
      ...repository,
      owner: users.find(u => u.id === repository.ownerId) || { id: repository.ownerId, username: 'Unknown', displayName: 'Unknown' },
      _count: {
        commits: 0,
        files: 0,
      },
    }

    return Response.json(repositoryWithOwner)
  } catch (error) {
    console.error('Error fetching repository:', error)
    return Response.json({ error: 'Failed to fetch repository' }, { status: 500 })
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

    const repositories = readDataFile('repositories.json')
    const repoIndex = repositories.findIndex(r => r.id === params.repoId)

    if (repoIndex === -1) {
      return Response.json({ error: 'Repository not found' }, { status: 404 })
    }

    const repository = repositories[repoIndex]

    // Check if user is admin or repository owner
    if (user.role !== 'ADMIN' && repository.ownerId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, isPublic } = body

    // Validate name if provided
    if (name !== undefined) {
      const nameValidation = validateName(name)
      if (!nameValidation.isValid) {
        return Response.json({ error: nameValidation.error }, { status: 400 })
      }
      repositories[repoIndex].name = sanitizeInput(name.trim())
    }

    // Validate description if provided
    if (description !== undefined) {
      const descriptionValidation = validateDescription(description)
      if (!descriptionValidation.isValid) {
        return Response.json({ error: descriptionValidation.error }, { status: 400 })
      }
      repositories[repoIndex].description = sanitizeInput(description.trim())
    }

    if (isPublic !== undefined) {
      repositories[repoIndex].isPublic = isPublic
    }

    writeDataFile('repositories.json', repositories)

    const updatedRepository = {
      ...repositories[repoIndex],
      owner: users.find(u => u.id === repositories[repoIndex].ownerId) || { id: repositories[repoIndex].ownerId, username: 'Unknown', displayName: 'Unknown' }
    }

    return Response.json(updatedRepository)
  } catch (error) {
    console.error('Error updating repository:', error)
    return Response.json({ error: 'Failed to update repository' }, { status: 500 })
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

    const repositories = readDataFile('repositories.json')
    const repoIndex = repositories.findIndex(r => r.id === params.repoId)

    if (repoIndex === -1) {
      return Response.json({ error: 'Repository not found' }, { status: 404 })
    }

    const repository = repositories[repoIndex]

    // Check if user is admin or repository owner
    if (user.role !== 'ADMIN' && repository.ownerId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    repositories.splice(repoIndex, 1)
    writeDataFile('repositories.json', repositories)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting repository:', error)
    return Response.json({ error: 'Failed to delete repository' }, { status: 500 })
  }
}
