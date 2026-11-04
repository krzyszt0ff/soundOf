import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { createPin, getNearbyPins } from "../controllers/pinController.js";

const router = express.Router();

// creating a new pin (logged-in users only)
// INPUT: deezer_track_id, lat, lon, description (optional)
// OUTPUT: success: true, pin OR success: false, error
router.post("/", requireAuth, createPin);

// loading pins around a point (user's location)
// INPUT (query): lat, lon, radius (optional, meters), limit (optional)
// OUTPUT: success: true, pins (sorted by distance) OR success: false, error 
router.get("/nearby", getNearbyPins);

export default router;
