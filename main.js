// main.js
require('dotenv').config();
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let authWindow;

// Create the main application window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false // More secure: only preload.js is allowed
        }
    });

    mainWindow.loadFile('index.html');
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC handlers
ipcMain.handle('get-spotify-client-id', () => {
    return process.env.SPOTIFY_CLIENT_ID;
});

ipcMain.on('open-auth-window', (event, authUrl) => {
    authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    authWindow.loadURL(authUrl);

    authWindow.webContents.on('will-redirect', (event, newUrl) => {
        if (newUrl.startsWith('https://localhost:8888/callback')) {
            const hash = newUrl.split('#')[1];
            const params = new URLSearchParams(hash);
            const token = params.get('access_token');

            if (token) {
                mainWindow.webContents.send('auth-token', token);
                authWindow.close();
            }
        }
    });
});
