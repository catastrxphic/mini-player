const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openAuthWindow: (url) => ipcRenderer.send('open-auth-window', url),
    onAuthToken: (callback) => ipcRenderer.on('auth-token', (event, token) => callback(token))
}); 