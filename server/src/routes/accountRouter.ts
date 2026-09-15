import express from 'express';
import { hello, register, login } from '../controllers/accountController.js';

const router = express.Router();

// test endpoint
router.get('/hello', hello);

// registering a new user
// INPUT: email, username, password
// OUTPUT: success: true, userId OR succes: false, error
router.post('/register', register);

// logging in an existing user
// INPUT: email OR username, password
// OUTPUT: success: true, userToken
router.post('/login', login);

export default router;