import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { followProfile, unfollowProfile, updateProfile, viewProfile, getFollowers, getFollowing, searchProfiles } from '../controllers/profileController.js';
import { getUserPins } from '../controllers/pinController.js';

const router = express.Router();

// editing profile info
// INPUT: display_name AND/OR avatar_url AND/OR bio
// OUTPUT: succes: true, profile OR success: false, error
router.patch("/me", requireAuth, updateProfile);

// searching profiles by username or display name
// INPUT (query): q, limit?, offset?
// OUTPUT: success: true, profiles OR success: false, error
router.get("/search", requireAuth, searchProfiles);

// viewing user profile
// INPUT: (params) id OR "me" to view own profile
// OUTPUT: success: true, profile OR success: false, error
router.get("/:profile_id", requireAuth, viewProfile);

// following user profile
// INPUT: (params) id (user to follow)
// OUTPUT: success: true, follow OR success: false, error
router.post("/:profile_id/follow", requireAuth, followProfile);

// unfollowing user profile
// INPUT: (params) id 
// OUTPUT: 204 No Content OR success: false, error
router.delete("/:profile_id/follow", requireAuth, unfollowProfile);

// list of users following the profile
// INPUT: (params) profile_id OR "me", (query) limit?, offset?
// OUTPUT: success: true, users OR success: false, error
router.get("/:profile_id/followers", requireAuth, getFollowers);

// list of users the profile follows
// INPUT: (params) profile_id OR "me", (query) limit?, offset?
// OUTPUT: success: true, users OR success: false, error
router.get("/:profile_id/following", requireAuth, getFollowing);

// list of pins the profile created
// INPUT: (params) profile_id OR "me", (query) limit?, offset?
// OUTPUT: success: true, pins OR success: false, error
router.get("/:profile_id/pins", requireAuth, getUserPins);

export default router;