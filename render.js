const { getSpotifyApi } = require('./spotify.js');

const spotifyApi = getSpotifyApi();

const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const app = express();
const port = 8888;

document.getElementById('spotify-login').addEventListener('click', function() {
    // Redirect to Spotify's login page
    window.location.href = 'https://localhost:8888/login';
});

// Function to fetch the current song playing on Spotify
async function getCurrentTrack() {
    try {
        const response = await fetch('https://localhost:8888/current-track');
        const data = await response.json();

        // Display the current track info in your HTML
        document.querySelector('.title').textContent = data.item.name;
        document.querySelector('.artistAlbum').textContent = `${data.item.artists[0].name} - ${data.item.album.name}`;
    } catch (err) {
        console.error('Error fetching current track:', err);
    }
}

// You can call this function to display the current track when needed
// For example, when the page loads or after login
getCurrentTrack();


// Spotify client credentials
const CLIENT_ID = process.env.spotify_id;
const CLIENT_SECRET = process.env.spotify_secret;
const REDIRECT_URI = 'https://localhost:8888/callback';

// Endpoint to redirect user to Spotify's login page
app.get('/login', (req, res) => {
    const scope = 'user-library-read user-read-playback-state user-modify-playback-state';
    const authURL = `https://accounts.spotify.com/authorize?${querystring.stringify({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: scope,
        show_dialog: true
    })}`;
    res.redirect(authURL);
});

// Callback endpoint where Spotify will redirect after login
app.get('/callback', async (req, res) => {
    const code = req.query.code;

    if (code) {
        try {
            // Request the access token from Spotify
            const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
                code: code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            }), {
                headers: {
                    'Authorization': 'Basic ' + new Buffer(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, refresh_token } = response.data;

            // Store the tokens somewhere safe (in memory for this example)
            global.accessToken = access_token;
            global.refreshToken = refresh_token;

            // Redirect the user back to the frontend with their tokens
            res.send('You are now authenticated with Spotify. You can close this window.');
        } catch (err) {
            console.error('Error during token exchange:', err);
            res.send('An error occurred during authentication.');
        }
    } else {
        res.send('Authentication failed');
    }
});

// Example route to get the currently playing track
app.get('/current-track', async (req, res) => {
    if (!global.accessToken) {
        return res.status(401).send('Not authenticated');
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                Authorization: `Bearer ${global.accessToken}`
            }
        });

        res.json(response.data);
    } catch (err) {
        console.error('Error fetching current track:', err);
        res.status(500).send('Error fetching current track');
    }
});

// Start the express server
app.listen(port, () => {
    console.log(`Server running at https://localhost:${port}`);
});


document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.querySelector('.play');
    const nextBtn = document.querySelector('.nextSong');
    const prevBtn = document.querySelector('.prevSong');
    const randomBtn = document.querySelector('.random');
    const loopBtn = document.querySelector('.loop');

    playBtn.addEventListener('click', async () => {
        const playbackState = await spotifyApi.getMyCurrentPlaybackState();
        if (playbackState.body.is_playing) {
            await spotifyApi.pause();
            console.log('Paused');
        } else {
            await spotifyApi.play();
            console.log('Playing');
        }
    });

    nextBtn.addEventListener('click', async () => {
        await spotifyApi.skipToNext();
        console.log('Skipped to next');
    });

    prevBtn.addEventListener('click', async () => {
        await spotifyApi.skipToPrevious();
        console.log('Skipped to previous');
    });

    randomBtn.addEventListener('click', async () => {
        const state = await spotifyApi.getMyCurrentPlaybackState();
        const shuffle = !state.body.shuffle_state;
        await spotifyApi.setShuffle({ state: shuffle });
        console.log('Shuffle toggled', shuffle);
    });

    loopBtn.addEventListener('click', async () => {
        await spotifyApi.setRepeat({ state: 'track' }); // options: 'track', 'context', 'off'
        console.log('Repeat toggled');
    });
});

const searchInput = document.querySelector('input[type="text"]');
const searchBtn = document.querySelector('button');

searchBtn.addEventListener('click', async () => {
    const query = searchInput.value;
    const result = await spotifyApi.searchTracks(query);
    console.log('Search results:', result.body.tracks.items);

    // Optionally, play first search result:
    if (result.body.tracks.items.length > 0) {
        const trackUri = result.body.tracks.items[0].uri;
        await spotifyApi.play({ uris: [trackUri] });
    }
});
