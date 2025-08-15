import { supabaseStorage, uploadToSupabase } from '../utils/supabaseStorage.js';
import { errorHandler } from '../utils/error.js';

export const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(errorHandler(400, 'No file uploaded'));
    }

    
    const uploadResult = await uploadToSupabase(req.file, 'profile-pictures');
    
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: uploadResult.publicUrl,
      path: uploadResult.path
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(errorHandler(500, 'Error uploading file'));
  }
};
