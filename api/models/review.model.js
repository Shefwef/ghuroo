import { db } from "../firebase.js";
import { v4 as uuidv4 } from "uuid";

export const ReviewSchema = {
  id: String,
  user_id: String,
  tour_id: String,
  rating: Number,
  comment: String,
  created_at: Date,
};

const REVIEW_DEFAULTS = {
  created_at: new Date()
};

// Validation functions
export const validateReview = (reviewData) => {
  const errors = [];
  
  if (!reviewData.user_id || typeof reviewData.user_id !== 'string' || reviewData.user_id.trim() === '') {
    errors.push('user_id is required and must be a valid user ID');
  }
  
  if (!reviewData.tour_id || typeof reviewData.tour_id !== 'string' || reviewData.tour_id.trim() === '') {
    errors.push('tour_id is required and must be a valid tour ID');
  }
  
  if (!reviewData.rating || typeof reviewData.rating !== 'number' || 
      !Number.isInteger(reviewData.rating) || reviewData.rating < 1 || reviewData.rating > 5) {
    errors.push('rating is required and must be an integer between 1 and 5');
  }
  
  if (reviewData.comment && typeof reviewData.comment !== 'string') {
    errors.push('comment must be a string if provided');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export class Review {
  constructor(reviewData) {
    this.id = reviewData.id || uuidv4();
    this.user_id = reviewData.user_id;
    this.tour_id = reviewData.tour_id;
    this.rating = Math.floor(reviewData.rating); // Ensure integer
    this.comment = reviewData.comment || null;
    this.created_at = reviewData.created_at || new Date();
  }

  toFirestore() {
    return {
      id: this.id,
      user_id: this.user_id,
      tour_id: this.tour_id,
      rating: this.rating,
      comment: this.comment,
      created_at: this.created_at
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Review({
      id: doc.id,
      ...data
    });
  }

  validate() {
    return validateReview(this);
  }

  // Check if review has a comment
  hasComment() {
    return this.comment && this.comment.trim() !== '';
  }

  // Get star display
  getStarDisplay() {
    return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
  }
}

// Database operations
export const ReviewModel = {
  async create(reviewData) {
    const validation = validateReview(reviewData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const review = new Review(reviewData);
    await db.collection('reviews').doc(review.id).set(review.toFirestore());
    return review;
  },

  // Find review by ID
  async findById(id) {
    const doc = await db.collection('reviews').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return Review.fromFirestore(doc);
  },

  // Update review
  async update(id, updateData) {
    const reviewRef = db.collection('reviews').doc(id);
    const updateObject = {
      ...updateData,
      updated_at: new Date()
    };
    
    await reviewRef.update(updateObject);
    return await this.findById(id);
  },

  // Delete review
  async delete(id) {
    await db.collection('reviews').doc(id).delete();
    return true;
  },

  // Get all reviews
  async getAll() {
    const snapshot = await db.collection('reviews').get();
    return snapshot.docs.map(doc => Review.fromFirestore(doc));
  },

  // Get reviews by user
  async getByUser(userId) {
    const snapshot = await db.collection('reviews').where('user_id', '==', userId).get();
    return snapshot.docs.map(doc => Review.fromFirestore(doc));
  },

  // Get reviews by tour
  async getByTour(tourId) {
    const snapshot = await db.collection('reviews').where('tour_id', '==', tourId).get();
    return snapshot.docs.map(doc => Review.fromFirestore(doc));
  },

  // Get reviews by rating
  async getByRating(rating) {
    const snapshot = await db.collection('reviews').where('rating', '==', rating).get();
    return snapshot.docs.map(doc => Review.fromFirestore(doc));
  },

  // Get reviews with minimum rating
  async getByMinRating(minRating) {
    const snapshot = await db.collection('reviews').where('rating', '>=', minRating).get();
    return snapshot.docs.map(doc => Review.fromFirestore(doc));
  },

  // Get recent reviews (last N reviews)
  async getRecent(limit = 10) {
    const snapshot = await db.collection('reviews')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => Review.fromFirestore(doc));
  },

  // Get tour reviews ordered by date (newest first)
  async getTourReviewsByDate(tourId, limit = null) {
    let query = db.collection('reviews')
      .where('tour_id', '==', tourId)
      .orderBy('created_at', 'desc');
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => Review.fromFirestore(doc));
  },

  // Get tour reviews ordered by rating (highest first)
  async getTourReviewsByRating(tourId, limit = null) {
    let query = db.collection('reviews')
      .where('tour_id', '==', tourId)
      .orderBy('rating', 'desc');
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => Review.fromFirestore(doc));
  },

  // Check if user has already reviewed a tour
  async hasUserReviewedTour(userId, tourId) {
    const snapshot = await db.collection('reviews')
      .where('user_id', '==', userId)
      .where('tour_id', '==', tourId)
      .get();
    return !snapshot.empty;
  },

  // Get user's review for a specific tour
  async getUserTourReview(userId, tourId) {
    const snapshot = await db.collection('reviews')
      .where('user_id', '==', userId)
      .where('tour_id', '==', tourId)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    return Review.fromFirestore(snapshot.docs[0]);
  },

  // Calculate average rating for a tour
  async getTourAverageRating(tourId) {
    const snapshot = await db.collection('reviews').where('tour_id', '==', tourId).get();
    
    if (snapshot.empty) {
      return 0;
    }
    
    let total = 0;
    snapshot.docs.forEach(doc => {
      const review = Review.fromFirestore(doc);
      total += review.rating;
    });
    
    return Math.round((total / snapshot.size) * 10) / 10; // Round to 1 decimal place
  },

  // Get tour rating distribution
  async getTourRatingDistribution(tourId) {
    const snapshot = await db.collection('reviews').where('tour_id', '==', tourId).get();
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    snapshot.docs.forEach(doc => {
      const review = Review.fromFirestore(doc);
      distribution[review.rating]++;
    });
    
    return distribution;
  },

  // Get tour review count
  async getTourReviewCount(tourId) {
    const snapshot = await db.collection('reviews').where('tour_id', '==', tourId).get();
    return snapshot.size;
  },

  // Get reviews with comments only
  async getReviewsWithComments(tourId = null) {
    let query = db.collection('reviews').where('comment', '!=', null);
    
    if (tourId) {
      query = query.where('tour_id', '==', tourId);
    }
    
    const snapshot = await query.get();
    return snapshot.docs
      .map(doc => Review.fromFirestore(doc))
      .filter(review => review.hasComment());
  },

  // Get tour statistics
  async getTourStats(tourId) {
    const [averageRating, reviewCount, ratingDistribution] = await Promise.all([
      this.getTourAverageRating(tourId),
      this.getTourReviewCount(tourId),
      this.getTourRatingDistribution(tourId)
    ]);
    
    return {
      averageRating,
      reviewCount,
      ratingDistribution
    };
  }
};