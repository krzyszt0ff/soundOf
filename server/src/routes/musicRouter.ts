import express from "express";
import { searchTracks } from "../controllers/musicController.js";

const router = express.Router();

// searching for tracks using Deezer API
// INPUT: q(search query), limit (optional), index(optional)
// OUTPUT: 
router.get("/search/tracks", searchTracks);

export default router;