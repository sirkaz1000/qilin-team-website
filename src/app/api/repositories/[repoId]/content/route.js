const { verifyToken } = require('@/lib/auth')
const { getFileContent, updateFile } = require('@/lib/git')

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

    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return Response.json({ error: 'Path is required' }, { status: 400 })
    }

    const content = await getFileContent(params.repoId, path)

    if (content === null) {
      return Response.json({ error: 'File not found' }, { status: 404 })
    }

    return Response.json({ content })
  } catch (error) {
    console.error('Error fetching file content:', error)
    return Response.json({ error: 'Failed to fetch file content' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
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
    const { path, content, message } = body

    if (!path || content === undefined) {
      return Response.json({ error: 'Path and content are required' }, { status: 400 })
    }

    await updateFile(params.repoId, path, content, message)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error updating file:', error)
    return Response.json({ error: 'Failed to update file' }, { status: 500 })
  }
}
