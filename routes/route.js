const express = require("express");
const router = express.Router();
const spotifyController = require("../controllers/controller");
const ensureSpotifyAccessToken = require("../middleware/checkSpotifyAuth");

router.get("/", (req, res) => {
  res.json({ message: "Spotify API Integration is working" });
});

// Route for login
router.get("/login", spotifyController.login);

// Route for handling the Spotify callback
router.get("/callback", spotifyController.callback);

// Route for getting the top tracks
router.get("/top", ensureSpotifyAccessToken, spotifyController.getTopTracks);

// Route for getting the current playing track
router.get("/now", ensureSpotifyAccessToken, spotifyController.getNowPlaying);

// Route for playing a track
router.get(
  "/play/:trackId",
  ensureSpotifyAccessToken,
  spotifyController.playTrack
);

// Route for pausing the track
router.get("/pause", ensureSpotifyAccessToken, spotifyController.pauseTrack);

module.exports = router;
