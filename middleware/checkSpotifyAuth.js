const { refreshAccessToken } = require("../utils/utils");

async function ensureSpotifyAccessToken(req, res, next) {
  if (!req.session.accessToken || !req.session.refreshToken) {
    return res.redirect("/spotify/login");
  }

  if (Date.now() >= req.session.expires_at) {
    try {
      const { access_token, expires_in } = await refreshAccessToken(
        req.session.refresh_token
      );
      req.session.access_token = access_token;
      req.session.expires_at = Date.now() + expires_in * 1000;
    } catch (err) {
      return res.status(401).json({ error: "Failed to refresh token" });
    }
  }

  next();
}

module.exports = ensureSpotifyAccessToken;
