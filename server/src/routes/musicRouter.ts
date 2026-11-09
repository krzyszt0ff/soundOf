import express from "express";
import { getTrackPreview, searchTracks } from "../controllers/musicController.js";

const router = express.Router();

// searching for tracks using Deezer API
// INPUT: q(search query), limit (optional), index(optional)
// OUTPUT: 
router.get("/search/tracks", searchTracks);

// getting a fresh 30s preview link for a track
// INPUT (params): deezerId
// OUTPUT: success: true, preview OR success: false, error
router.get("/tracks/:deezerId/preview", getTrackPreview);

export default router;