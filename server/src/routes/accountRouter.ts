import express from 'express';
import { hello, register } from '../controllers/accountController.js';

const router = express.Router();

// test endpoint
router.get('/hello', hello);

// registering a new user
// INPUT: email, username, password
// OUTPUT: success: true, userId OR succes: false, error
router.post('/register', register);

export default router;