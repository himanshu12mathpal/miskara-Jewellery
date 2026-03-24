import express from 'express';

import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController.js';

import { protect } from '../middleware/authMiddleware.js';

import { adminOnly } from '../middleware/adminMiddleware.js';



const router = express.Router();



router.route('/')

  .get(getCategories)

  .post(protect, adminOnly, createCategory);



router.route('/:id')

  .delete(protect, adminOnly, deleteCategory);



export default router;

