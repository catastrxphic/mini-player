 // spotify.js
const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const open = require('open');

const app = express();
const port = 8888;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.spotify_id,
    clientSecret: process.env.spotify_secret,
    redirectUri: `https://localhost:${8888}/callback`
});

// Step 1: Get Authorization
const scopes = ['user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing'];

function authorizeSpotify() {
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'some-state-of-your-choice');

    // Open the URL in the default browser
    open(authorizeURL);

    app.get('/callback', async (req, res) => {
        const { code } = req.query;
        const data = await spotifyApi.authorizationCodeGrant(code);

        spotifyApi.setAccessToken(data.body.access_token);
        spotifyApi.setRefreshToken(data.body.refresh_token);

        res.send('Authorization successful! You can close this window.');

        console.log('Spotify authorized ✅');
    });

    app.listen(port, () => {
        console.log(`Listening at https://localhost:${port}`);
    });
}

function getSpotifyApi() {
    return spotifyApi;
}

module.exports = { authorizeSpotify, getSpotifyApi };
