const mongoose = require('mongoose')

const AchievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  iconUrl: {
    type: String,
    default: null
  },
  imageUrl: {
    type: String,
    default: null
  },
  videoUrl: {
    type: String,
    default: null
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  authorId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema)
