const { verifyToken } = require('@/lib/auth-simple')
const { getFAQs, createFAQ } = require('@/lib/data-simple')

export async function GET(request) {
  try {
    const faqs = getFAQs()
    return Response.json(faqs)
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return Response.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
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
    const { questionAr, questionEn, answerAr, answerEn, order } = body

    const faq = createFAQ({
      questionAr,
      questionEn,
      answerAr,
      answerEn,
      order: order || 0,
    })

    return Response.json(faq)
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return Response.json({ error: 'Failed to create FAQ' }, { status: 500 })
  }
}
