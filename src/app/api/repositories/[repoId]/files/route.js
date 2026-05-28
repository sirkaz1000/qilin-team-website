const { verifyToken } = require('@/lib/auth')
const { getFileTree } = require('@/lib/git')

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
    const path = searchParams.get('path') || ''

    const files = await getFileTree(params.repoId, path)

    return Response.json(files)
  } catch (error) {
    console.error('Error fetching files:', error)
    return Response.json({ error: 'Failed to fetch files' }, { status: 500 })
  }
}
