import { db } from "../firebase.js";
import { v4 as uuidv4 } from "uuid";

// User schema definition for Firestore
export const UserSchema = {
  id: String,           
  full_name: String,   
  email: String,     
  password_hash: String, 
  created_at: Date,    
  role: String,        
};

const USER_DEFAULTS = {
  role: "user",
  created_at: new Date()
};

// Validation functions
export const validateUser = (userData) => {
  const errors = [];
  
  if (!userData.full_name || typeof userData.full_name !== 'string' || userData.full_name.trim() === '') {
    errors.push('full_name is required and must be a non-empty string');
  }
  
  if (!userData.email || typeof userData.email !== 'string' || !isValidEmail(userData.email)) {
    errors.push('email is required and must be a valid email address');
  }
  
  if (userData.role && !['user', 'admin'].includes(userData.role)) {
    errors.push('role must be either "user" or "admin"');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// User model class
export class User {
  constructor(userData) {
    this.id = userData.id || uuidv4();
    this.full_name = userData.full_name;
    this.email = userData.email;
    this.password_hash = userData.password_hash || null;
    this.created_at = userData.created_at || new Date();
    this.role = userData.role || USER_DEFAULTS.role;
  }

  // Convert to plain object for Firestore
  toFirestore() {
    return {
      id: this.id,
      full_name: this.full_name,
      email: this.email,
      password_hash: this.password_hash,
      created_at: this.created_at,
      role: this.role
    };
  }

  // Create from Firestore document
  static fromFirestore(doc) {
    const data = doc.data();
    return new User({
      id: doc.id,
      ...data
    });
  }

  // Validate the user instance
  validate() {
    return validateUser(this);
  }
}

// Database operations
export const UserModel = {
  // Create a new user
  async create(userData) {
    const validation = validateUser(userData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const user = new User(userData);
    await db.collection('users').doc(user.id).set(user.toFirestore());
    return user;
  },

  // Find user by ID
  async findById(id) {
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return User.fromFirestore(doc);
  },

  // Find user by email
  async findByEmail(email) {
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) {
      return null;
    }
    return User.fromFirestore(snapshot.docs[0]);
  },

  // Update user
  async update(id, updateData) {
    const userRef = db.collection('users').doc(id);
    const updateObject = {
      ...updateData,
      updated_at: new Date()
    };
    
    await userRef.update(updateObject);
    return await this.findById(id);
  },

  // Delete user
  async delete(id) {
    await db.collection('users').doc(id).delete();
    return true;
  },

  // Get all users
  async getAll() {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => User.fromFirestore(doc));
  },

  // Get users by role
  async getByRole(role) {
    const snapshot = await db.collection('users').where('role', '==', role).get();
    return snapshot.docs.map(doc => User.fromFirestore(doc));
  },

  // Get all regular users (non-admin)
  async getRegularUsers() {
    return await this.getByRole('user');
  },

  // Get all admin users
  async getAdminUsers() {
    return await this.getByRole('admin');
  },

  // Check if email exists
  async emailExists(email) {
    const user = await this.findByEmail(email);
    return user !== null;
  },

  // Check if user is admin
  async isAdmin(id) {
    const user = await this.findById(id);
    return user && user.role === 'admin';
  }
};