// render.js
const { getSpotifyApi } = require('./spotify.js');

const spotifyApi = getSpotifyApi();

// Handle the Spotify login button
document.getElementById('spotify-login').addEventListener('click', () => {
    // Redirect the user to backend /login route
    window.location.href = 'https://localhost:8888/login';
});

// Function to get the currently playing track
async function getCurrentTrack() {
    try {
        const response = await fetch('https://localhost:8888/current-track');
        const data = await response.json();

        if (data.item) {
            document.querySelector('.title').textContent = data.item.name;
            document.querySelector('.artistAlbum').textContent = `${data.item.artists[0].name} - ${data.item.album.name}`;
        }
    } catch (error) {
        console.error('Error fetching current track:', error);
    }
}

// Call when page loads
getCurrentTrack();

// Player control buttons
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
        await spotifyApi.setRepeat({ state: 'track' }); // 'track', 'context', or 'off'
        console.log('Repeat toggled');
    });
});

// Handle searching for a track
const searchInput = document.querySelector('input[type="text"]');
const searchBtn = document.querySelector('button');

searchBtn.addEventListener('click', async () => {
    const query = searchInput.value;
    const result = await spotifyApi.searchTracks(query);
    console.log('Search results:', result.body.tracks.items);

    // Auto-play the first result
    if (result.body.tracks.items.length > 0) {
        const trackUri = result.body.tracks.items[0].uri;
        await spotifyApi.play({ uris: [trackUri] });
    }
});
