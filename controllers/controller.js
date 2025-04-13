const axios = require("axios");
const querystring = require("querystring");
const { getActiveDevices } = require("../utils/utils");

// Step 1: Spotify Login
exports.login = (req, res) => {
  const scopes =
    "user-read-playback-state user-modify-playback-state user-read-currently-playing user-top-read streaming";
  const authURL =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scopes,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    });
  res.redirect(authURL);
};

// Step 2: Spotify OAuth Callback
exports.callback = async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;

    // Store the tokens in session or database (use session or DB as per your design)
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;
    req.session.expires_at = Date.now() + response.data.expires_in * 1000; // in ms


    res.redirect("/spotify/top"); // Home route
  } catch (err) {
    console.error(err);
    res.send("Error during authentication");
  }
};

// Step 3: Get Top Tracks
exports.getTopTracks = async (req, res) => {
  try {
    const topTracks = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks?limit=10",
      {
        headers: { Authorization: `Bearer ${req.session.accessToken}` },
      }
    );

    res.json(
      topTracks.data.items.map((track) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((a) => a.name),
        uri: track.uri,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top tracks" });
  }
};

// Step 4: Get Now Playing Track
exports.getNowPlaying = async (req, res) => {
  try {
    const now = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: `Bearer ${req.session.accessToken}` },
      }
    );

    if (!now.data) return res.json({ message: "Nothing is playing" });

    const track = now.data.item;
    res.json({
      id: track.id,
      name: track.name,
      artists: track.artists.map((a) => a.name),
      is_playing: now.data.is_playing,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch now playing" });
  }
};

// Step 5: Play a Track
exports.playTrack = async (req, res) => {
  const { trackId } = req.params;
  const deviceId = await getActiveDevices(req.session.accessToken);
  try {
    await axios.put(
      "https://api.spotify.com/v1/me/player/play?device_id=" + deviceId,
      {
        uris: [`spotify:track:${trackId}`],
      },
      {
        headers: { Authorization: `Bearer ${req.session.accessToken}` },
      }
    );

    res.json({ message: `Playing track ${trackId}` });
  } catch (err) {
    if (err?.status === 403) {
      res.status(403).json({ error: "Premium account is required" });
      return;
    }
    res.status(500).json({ error: "Failed to play track" });
  }
};

// Step 6: Pause Playback
exports.pauseTrack = async (req, res) => {
  try {
    await axios.put(
      "https://api.spotify.com/v1/me/player/pause",
      {},
      {
        headers: { Authorization: `Bearer ${req.session.accessToken}` },
      }
    );

    res.json({ message: "Playback paused" });
  } catch (err) {
    if (err?.status === 403) {
      res.status(403).json({ error: "Premium account is required" });
      return;
    }
    res.status(500).json({ error: "Failed to pause playback" });
  }
};
