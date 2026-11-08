import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { commentPin, createPin, deleteComment, getNearbyPins, likePin, unlikePin } from "../controllers/pinController.js";

const router = express.Router();

// creating a new pin (logged-in users only)
// INPUT: deezer_track_id, lat, lon, description (optional)
// OUTPUT: success: true, pin OR success: false, error
router.post("/", requireAuth, createPin);

// loading pins around a point (user's location)
// INPUT (query): lat, lon, radius (optional, meters), limit (optional)
// OUTPUT: success: true, pins (sorted by distance) OR success: false, error 
router.get("/nearby", getNearbyPins);

// liking a pin (logged-in users only)
// INPUT (params): id
// OUTPUT: success: true, pinLike OR success: false, error
router.post("/:id/like", requireAuth, likePin);

// unliking a pin (logged-in users only)
// INPUT (params): id
// OUTPUT: 204 No Content OR success: false, error
router.delete("/:id/like", requireAuth, unlikePin);

// commenting a pin (logged-in users only)
// INPUT: (params) id, (body) comment
// OUTPUT: success: true, comment OR success: false, error
router.post("/:id/comment", requireAuth, commentPin);

// deleting a pin comment (logged-in users only)
// INPUT (params): (Pin) id, commentId
// OUTPUT: 204 No Content OR success: false, error
router.delete("/:id/comment/:commentId", requireAuth, deleteComment);

export default router;
