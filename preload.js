// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose API to the renderer process
contextBridge.exposeInMainWorld('electron', {
    getSpotifyClientId: () => ipcRenderer.invoke('get-spotify-client-id'),
    openAuthWindow: (authUrl) => ipcRenderer.send('open-auth-window', authUrl),
    onAuthToken: (callback) => ipcRenderer.on('auth-token', (event, token) => callback(token))
});
