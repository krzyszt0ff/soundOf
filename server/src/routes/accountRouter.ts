import express from 'express';
import { hello, register, login, logout } from '../controllers/accountController.js';

const router = express.Router();

// test endpoint
router.get('/hello', hello);

// registering a new user
// INPUT: email, username, password
// OUTPUT: success: true, userId OR succes: false, error
router.post('/register', register);

// logging in an existing user
// INPUT: identifier (email OR username), password
// OUTPUT: success: true OR succes: false, error
router.post('/login', login);

// logging out
// INPUT: nah not really
// OUTPUT: success: true
router.post('/logout', logout);

export default router;