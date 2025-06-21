import { db } from "../firebase.js";
import { v4 as uuidv4 } from "uuid";

export const TourSchema = {
  id: String,
  title: String,
  description: String,
  itinerary: String,
  price: Number,
  location: String,
  duration_days: Number,
  is_featured: Boolean,
  thumbnail_url: String,
  gallery_urls: Array,
  created_by: String,
  created_at: Date,
};

const TOUR_DEFAULTS = {
  is_featured: false,
  gallery_urls: [],
  created_at: new Date()
};

// Validation functions
export const validateTour = (tourData) => {
  const errors = [];
  
  if (!tourData.title || typeof tourData.title !== 'string' || tourData.title.trim() === '') {
    errors.push('title is required and must be a non-empty string');
  }
  
  if (!tourData.description || typeof tourData.description !== 'string' || tourData.description.trim() === '') {
    errors.push('description is required and must be a non-empty string');
  }
  
  if (!tourData.price || typeof tourData.price !== 'number' || tourData.price <= 0) {
    errors.push('price is required and must be a positive number');
  }
  
  if (!tourData.location || typeof tourData.location !== 'string' || tourData.location.trim() === '') {
    errors.push('location is required and must be a non-empty string');
  }
  
  if (!tourData.duration_days || typeof tourData.duration_days !== 'number' || tourData.duration_days <= 0) {
    errors.push('duration_days is required and must be a positive integer');
  }
  
  if (!tourData.thumbnail_url || typeof tourData.thumbnail_url !== 'string' || tourData.thumbnail_url.trim() === '') {
    errors.push('thumbnail_url is required and must be a non-empty string');
  }
  
  if (!tourData.created_by || typeof tourData.created_by !== 'string' || tourData.created_by.trim() === '') {
    errors.push('created_by is required and must be a valid user ID');
  }
  
  if (tourData.gallery_urls && !Array.isArray(tourData.gallery_urls)) {
    errors.push('gallery_urls must be an array');
  }
  
  if (tourData.is_featured !== undefined && typeof tourData.is_featured !== 'boolean') {
    errors.push('is_featured must be a boolean');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};


export class Tour {
  constructor(tourData) {
    this.id = tourData.id || uuidv4();
    this.title = tourData.title;
    this.description = tourData.description;
    this.itinerary = tourData.itinerary || null;
    this.price = tourData.price;
    this.location = tourData.location;
    this.duration_days = Math.floor(tourData.duration_days); // Ensure integer
    this.is_featured = tourData.is_featured !== undefined ? tourData.is_featured : TOUR_DEFAULTS.is_featured;
    this.thumbnail_url = tourData.thumbnail_url;
    this.gallery_urls = tourData.gallery_urls || TOUR_DEFAULTS.gallery_urls;
    this.created_by = tourData.created_by;
    this.created_at = tourData.created_at || new Date();
  }


  toFirestore() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      itinerary: this.itinerary,
      price: this.price,
      location: this.location,
      duration_days: this.duration_days,
      is_featured: this.is_featured,
      thumbnail_url: this.thumbnail_url,
      gallery_urls: this.gallery_urls,
      created_by: this.created_by,
      created_at: this.created_at
    };
  }

  
  static fromFirestore(doc) {
    const data = doc.data();
    return new Tour({
      id: doc.id,
      ...data
    });
  }

  
  validate() {
    return validateTour(this);
  }
}

// Database operations
export const TourModel = {
  async create(tourData) {
    const validation = validateTour(tourData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const tour = new Tour(tourData);
    await db.collection('tours').doc(tour.id).set(tour.toFirestore());
    return tour;
  },

  // Find tour by ID
  async findById(id) {
    const doc = await db.collection('tours').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return Tour.fromFirestore(doc);
  },

  // Update tour
  async update(id, updateData) {
    const tourRef = db.collection('tours').doc(id);
    const updateObject = {
      ...updateData,
      updated_at: new Date()
    };
    
    await tourRef.update(updateObject);
    return await this.findById(id);
  },

  // Delete tour
  async delete(id) {
    await db.collection('tours').doc(id).delete();
    return true;
  },

  // Get all tours
  async getAll() {
    const snapshot = await db.collection('tours').get();
    return snapshot.docs.map(doc => Tour.fromFirestore(doc));
  },

  // Get featured tours
  async getFeatured() {
    const snapshot = await db.collection('tours').where('is_featured', '==', true).get();
    return snapshot.docs.map(doc => Tour.fromFirestore(doc));
  },

  // Get tours by location
  async getByLocation(location) {
    const snapshot = await db.collection('tours').where('location', '==', location).get();
    return snapshot.docs.map(doc => Tour.fromFirestore(doc));
  },

  // Get tours by creator
  async getByCreator(userId) {
    const snapshot = await db.collection('tours').where('created_by', '==', userId).get();
    return snapshot.docs.map(doc => Tour.fromFirestore(doc));
  },

  // Get tours by price range
  async getByPriceRange(minPrice, maxPrice) {
    const snapshot = await db.collection('tours')
      .where('price', '>=', minPrice)
      .where('price', '<=', maxPrice)
      .get();
    return snapshot.docs.map(doc => Tour.fromFirestore(doc));
  },

  // Get tours by duration
  async getByDuration(minDays, maxDays) {
    const snapshot = await db.collection('tours')
      .where('duration_days', '>=', minDays)
      .where('duration_days', '<=', maxDays)
      .get();
    return snapshot.docs.map(doc => Tour.fromFirestore(doc));
  },

  // Search tours by title or description
  async search(searchTerm) {
    const snapshot = await db.collection('tours').get();
    const tours = snapshot.docs.map(doc => Tour.fromFirestore(doc));
    
    return tours.filter(tour => 
      tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
};