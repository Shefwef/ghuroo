import express from 'express';
import { uploadProfilePicture } from '../controllers/upload.controller.js';
import { supabaseStorage } from '../utils/supabaseStorage.js';
import { verifyUser } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/profile-picture', verifyUser, supabaseStorage.single('profilePicture'), uploadProfilePicture);

export default router;
