// spotify.js
const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const open = require('open');

const app = express();
const port = 8888;

// Set up Spotify API with credentials
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: `https://localhost:${port}/callback`
});

// Define the authorization scopes
const scopes = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
];

function authorizeSpotify() {
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'some-state');

    // Open the URL in the user's default browser
    open(authorizeURL);

    // Handle the callback after authorization
    app.get('/callback', async (req, res) => {
        const { code } = req.query;

        try {
            const data = await spotifyApi.authorizationCodeGrant(code);

            spotifyApi.setAccessToken(data.body.access_token);
            spotifyApi.setRefreshToken(data.body.refresh_token);

            res.send('Authorization successful! You can close this window.');
            console.log('✅ Spotify authorized successfully');
        } catch (error) {
            console.error('❌ Error during authorization:', error);
            res.send('Authorization failed.');
        }
    });

    app.listen(port, () => {
        console.log(`🚀 Listening on https://localhost:${port}`);
    });
}

function getSpotifyApi() {
    return spotifyApi;
}

module.exports = { authorizeSpotify, getSpotifyApi };
