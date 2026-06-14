const { verifyToken } = require('@/lib/auth-simple')
const { getFAQs, createFAQ } = require('@/lib/data-simple')
const fs = require('fs')
const path = require('path')

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'auth' or 'general'
    
    const faqs = getFAQs()
    
    // Filter by type if specified
    const filteredFAQs = type ? faqs.filter(faq => faq.type === type) : faqs
    
    return Response.json(filteredFAQs)
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
    const { questionAr, questionEn, answerAr, answerEn, type, order } = body

    const faq = createFAQ({
      questionAr,
      questionEn,
      answerAr,
      answerEn,
      type: type || 'general', // Default to 'general' if not specified
      order: order || 0,
    })

    return Response.json(faq)
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return Response.json({ error: 'Failed to create FAQ' }, { status: 500 })
  }
}

export async function PUT(request) {
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
    const { id, questionAr, questionEn, answerAr, answerEn, type, order } = body

    const faqs = getFAQs()
    const index = faqs.findIndex(faq => faq.id === id)

    if (index === -1) {
      return Response.json({ error: 'FAQ not found' }, { status: 404 })
    }

    faqs[index] = {
      ...faqs[index],
      questionAr: questionAr || faqs[index].questionAr,
      questionEn: questionEn || faqs[index].questionEn,
      answerAr: answerAr || faqs[index].answerAr,
      answerEn: answerEn || faqs[index].answerEn,
      type: type !== undefined ? type : faqs[index].type,
      order: order !== undefined ? order : faqs[index].order,
      updatedAt: new Date().toISOString()
    }

    const filePath = path.join(process.cwd(), 'data', 'faq.json')
    fs.writeFileSync(filePath, JSON.stringify(faqs, null, 2))

    return Response.json(faqs[index])
  } catch (error) {
    console.error('Error updating FAQ:', error)
    return Response.json({ error: 'Failed to update FAQ' }, { status: 500 })
  }
}

export async function DELETE(request) {
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
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'FAQ ID is required' }, { status: 400 })
    }

    const faqs = getFAQs()
    const index = faqs.findIndex(faq => faq.id === id)

    if (index === -1) {
      return Response.json({ error: 'FAQ not found' }, { status: 404 })
    }

    faqs.splice(index, 1)

    const filePath = path.join(process.cwd(), 'data', 'faq.json')
    fs.writeFileSync(filePath, JSON.stringify(faqs, null, 2))

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return Response.json({ error: 'Failed to delete FAQ' }, { status: 500 })
  }
}
