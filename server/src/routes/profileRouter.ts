import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { updateProfile } from '../controllers/userController.js';

const router = express.Router();

// editing profile info
// INPUT: display_name AND/OR avatar_url AND/OR bio
// OUTPUT: succes: true, profile OR success: false, error
router.patch("/me", requireAuth, updateProfile);

export default router;