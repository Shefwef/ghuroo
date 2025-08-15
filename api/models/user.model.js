import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profilePicture: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});


userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});


userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export const UserModel = {
  async create(userData) {
    return await User.create(userData);
  },

  async findById(id) {
    return await User.findById(id);
  },

  async findByEmail(email) {
    return await User.findOne({ email });
  },

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await User.findByIdAndDelete(id);
  },

  async getAll() {
    return await User.find();
  },

  async getByRole(role) {
    return await User.find({ role });
  },

  async getRegularUsers() {
    return await User.find({ role: 'user' });
  },

  async getAdminUsers() {
    return await User.find({ role: 'admin' });
  },

  async emailExists(email) {
    const user = await User.findOne({ email });
    return user !== null;
  },

  async isAdmin(id) {
    const user = await User.findById(id);
    return user && user.role === 'admin';
  }
};

export default User;