const {app, BrowserWindow, Menu, ipcMain, shell, dialog} = require('electron');
const path = require('path');
const fs = require('fs');

const isMac = process.platform == 'darwin';
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
};

// Function to delete a file
const deleteFile = (filePath) => {
    try {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
    } catch (err) {
        console.error(`Error deleting file: ${filePath}`, err);
    }
};

const deleteAllFiles = () => {
    const tempDir = app.getPath('temp');
    const pdfDir = path.join(tempDir, 'pdf-interpreter');
    if (fs.existsSync(pdfDir)) {
        fs.readdirSync(pdfDir).forEach((file) => {
            const filePath = path.join(pdfDir, file);
            deleteFile(filePath);
        });
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

ipcMain.on('reset-pdfs', () => {
    deleteAllFiles();
});

ipcMain.on('delete-pdf', (event, fileName) => {
    const tempDir = app.getPath('temp');
    const pdfDir = path.join(tempDir, 'pdf-interpreter');
    const pdfPath = path.join(pdfDir, fileName);

    deleteFile(pdfPath);
});

// Function to get a list of PDF files in the temp folder
ipcMain.on('get-pdf-list', (event) => {
    const tempDir = app.getPath('temp');
    const pdfDir = path.join(tempDir, 'pdf-interpreter');
    let pdfFiles = [];

    if (fs.existsSync(pdfDir)) {
        pdfFiles = fs.readdirSync(pdfDir).map((file) => path.join(pdfDir, file));
    }

    event.reply('pdf-list', pdfFiles);
});

// APP ACTIONS

app.whenReady().then(() => {
    createMainWindow();

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
    if (!isMac) {
        deleteAllFiles();
        app.quit();
    }
    
});

