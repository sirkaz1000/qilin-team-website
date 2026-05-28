const { verifyToken } = require('@/lib/auth-simple')
const { readDataFile, writeDataFile, generateId } = require('@/lib/data-simple')

// Input validation helpers
function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input.replace(/[<>]/g, '')
}

function validateRating(rating) {
  if (rating === undefined || rating === null) {
    return { isValid: false, error: 'Rating is required' }
  }
  if (rating < 1 || rating > 5) {
    return { isValid: false, error: 'Rating must be between 1 and 5' }
  }
  return { isValid: true }
}

function validateComment(comment) {
  if (!comment) return { isValid: true }
  if (comment.length > 500) {
    return { isValid: false, error: 'Comment must be less than 500 characters' }
  }
  return { isValid: true }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = sanitizeInput(searchParams.get('itemId'))

    const reviews = readDataFile('store-reviews.json')
    const users = readDataFile('users.json')
    
    let filteredReviews = reviews
    if (itemId) {
      filteredReviews = filteredReviews.filter(r => r.itemId === itemId)
    }

    // Add user info to reviews
    const reviewsWithUsers = filteredReviews.map(review => ({
      ...review,
      user: users.find(u => u.id === review.userId) || { username: 'Unknown' }
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return Response.json(reviewsWithUsers)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return Response.json({ error: 'Failed to fetch reviews' }, { status: 500 })
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
    const { itemId, rating, comment } = body

    if (!itemId) {
      return Response.json({ error: 'Item ID is required' }, { status: 400 })
    }

    // Validate rating
    const ratingValidation = validateRating(rating)
    if (!ratingValidation.isValid) {
      return Response.json({ error: ratingValidation.error }, { status: 400 })
    }

    // Validate comment if provided
    if (comment) {
      const commentValidation = validateComment(comment)
      if (!commentValidation.isValid) {
        return Response.json({ error: commentValidation.error }, { status: 400 })
      }
    }

    const reviews = readDataFile('store-reviews.json')
    const newReview = {
      id: generateId(),
      itemId: sanitizeInput(itemId),
      userId: user.id,
      rating,
      comment: comment ? sanitizeInput(comment.trim()) : null,
      createdAt: new Date().toISOString()
    }
    reviews.push(newReview)
    writeDataFile('store-reviews.json', reviews)

    // Add user info to response
    const reviewWithUser = {
      ...newReview,
      user: { username: user.username }
    }

    return Response.json(reviewWithUser)
  } catch (error) {
    console.error('Error creating review:', error)
    return Response.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
