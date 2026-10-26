import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { updateProfile } from '../controllers/userController.js';

const router = express.Router();

router.patch("/me", requireAuth, updateProfile);

export default router;