const axios = require("axios");

async function refreshAccessToken(refreshToken) {
  const auth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return {
    access_token: res.data.access_token,
    expires_in: res.data.expires_in,
  };
}

async function getActiveDevices(accessToken) {
  const response = await axios.get(
    "https://api.spotify.com/v1/me/player/devices",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const activeDevice = response.data.devices.find((device) => device.is_active);

  return activeDevice ? activeDevice.id : null;
}

module.exports = { refreshAccessToken, getActiveDevices };
