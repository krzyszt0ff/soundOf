import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { createPin } from "../controllers/pinController.js";

const router = express.Router();

// creating a new pin (logged-in users only)
// INPUT: deezer_track_id, lat, lon, description (optional)
// OUTPUT: success: true, pin OR success: false, error
router.post("/", requireAuth, createPin);

export default router;
