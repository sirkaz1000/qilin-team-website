const { verifyToken } = require('@/lib/auth-simple')
const { getAchievements, createAchievement } = require('@/lib/data-simple')

export async function GET(request) {
  try {
    const achievements = getAchievements()
    return Response.json(achievements)
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return Response.json({ error: 'Failed to fetch achievements' }, { status: 500 })
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
    const { title, description, iconUrl, imageUrl, videoUrl, isFeatured } = body

    const achievement = createAchievement({
      title,
      description,
      iconUrl: iconUrl || null,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      isFeatured: isFeatured || false,
      authorId: decoded.userId,
    })

    return Response.json(achievement)
  } catch (error) {
    console.error('Error creating achievement:', error)
    return Response.json({ error: 'Failed to create achievement' }, { status: 500 })
  }
}
