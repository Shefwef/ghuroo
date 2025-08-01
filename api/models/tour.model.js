import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  itinerary: String,
  price: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  duration_days: {
    type: Number,
    required: true
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  thumbnail_url: {
    type: String,
    required: true
  },
  gallery_urls: [String],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Add text search indexes
tourSchema.index({ 
  title: 'text', 
  description: 'text', 
  location: 'text' 
});

const Tour = mongoose.model('Tour', tourSchema);

export default Tour;