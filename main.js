const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;
let authWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
}

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

// Handle Spotify OAuth
ipcMain.on('open-auth-window', (event, authUrl) => {
    authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    authWindow.loadURL(authUrl);

    authWindow.webContents.on('will-redirect', (event, url) => {
        if (url.startsWith('http://localhost:8888/callback')) {
            const hash = url.split('#')[1];
            const params = new URLSearchParams(hash);
            const token = params.get('access_token');
            
            if (token) {
                mainWindow.webContents.send('auth-token', token);
                authWindow.close();
            }
        }
    });
});
