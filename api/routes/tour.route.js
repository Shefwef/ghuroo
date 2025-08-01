import express from 'express';
import { verifyAdmin } from '../utils/verifyAdmin.js';

import {
  createTour,
  getAllTours,
  getTourById,
  updateTour,
  deleteTour,
  searchTours,
  getFeaturedTours,
  upload
} from '../controllers/tour.controller.js';

const router = express.Router();

const uploadFields = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]);

router.post('/', verifyAdmin, uploadFields, createTour);
router.get('/', getAllTours);
router.get('/featured', getFeaturedTours);
router.get('/search/:term', searchTours);
router.get('/:id', getTourById);
router.put('/:id', verifyAdmin, uploadFields, updateTour);
router.delete('/:id', verifyAdmin, deleteTour);

export default router;