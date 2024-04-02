const {app, BrowserWindow, Menu, ipcMain, shell, dialog} = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const isMac = process.platform == 'darwin';
const isDev = process.env.NODE_ENV !== 'production';

const tempDir = app.getPath('temp');
const appDir = path.join(tempDir, 'pdf-interpreter');
const pdfDir = path.join(appDir, 'pdfs');

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
    if (fs.existsSync(pdfDir)) {
        fs.readdirSync(pdfDir).forEach((file) => {
            const filePath = path.join(pdfDir, file);
            deleteFile(filePath);
        });
    }
}

const runPythonScript = () => {
    // Path to the virtual environment's activate script
    const venvPath = path.join(__dirname, 'python-scripts', 'venv');
    console.log(venvPath);
    const venvActivateScript = path.join(venvPath, 'Scripts', 'activate');

    // Path to the Python script within the virtual environment
    const pythonScriptPath = path.join(venvPath, 'Scripts', 'python.exe');
    const mainScriptPath = path.join(__dirname, 'python-scripts', 'main.py');

    // Activate the virtual environment
    const activateProcess = spawn(venvActivateScript, [], { shell: true });

    // Run the Python script
    activateProcess.on('close', (code) => {
        console.log(code);
        if (code === 0) {
            const pythonProcess = spawn(pythonScriptPath, [mainScriptPath]);

            pythonProcess.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            pythonProcess.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
            });
        } else {
            console.error('Failed to activate virtual environment');
        }
    });
};

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
    console.log('Analyze 7Pdfs');
    runPythonScript();
});

ipcMain.on('save-pdfs', (event, pdfPaths) => {
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(appDir);
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
    const pdfPath = path.join(pdfDir, fileName);

    deleteFile(pdfPath);
});

// Function to get a list of PDF files in the temp folder
ipcMain.on('get-pdf-list', (event) => {
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

