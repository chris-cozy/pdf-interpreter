const {app, BrowserWindow, Menu, ipcMain, shell, dialog} = require('electron');
const path = require('path');
const fs = require('fs');

const isMac = process.platform == 'darwin';
// If we are in a development environment
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;

const createMainWindow = () => {
	mainWindow = new BrowserWindow({
		title: "Home",
		width: isDev ? 1000 : 800,
		height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
	});
	
	mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));

    if (isDev){
        mainWindow.webContents.openDevTools();
    }
}

const menu = [
  ]

// IPC COMMUNICATION

ipcMain.on('open-file-dialog', (event) => {
    dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    }).then((result) => {
        if (!result.canceled) {
            event.reply('selected-files', result.filePaths);
        }
    }).catch((err) => {
        console.log(err);
    });
});

ipcMain.on('analyze-pdfs', (event) => {
    console.log('Analyze Pdfs');
});

ipcMain.on('save-pdfs', (event, pdfPaths) => {
    const tempDir = app.getPath('temp');
    const pdfDir = path.join(tempDir, 'pdf-interpreter');
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir);
    }

    pdfPaths.forEach((pdfPath) => {
        const fileName = path.basename(pdfPath);
        const destPath = path.join(pdfDir, fileName);
        fs.copyFileSync(pdfPath, destPath);
    });
});

// APP ACTIONS

app.whenReady().then(() => {
    createMainWindow();

    // Implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu)

    // Remove mainWindow from memory on close, to prevent leak
    mainWindow.on('closed', () => (mainWindow = null))

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', () => {
    if (!isMac) app.quit();
});

