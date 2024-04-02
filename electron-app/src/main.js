const {app, BrowserWindow, Menu, ipcMain, shell, dialog} = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const { error } = require('console');

const isMac = process.platform == 'darwin';
const isDev = process.env.NODE_ENV !== 'production';

const tempDir = app.getPath('temp');
const appDir = path.join(tempDir, 'pdf-interpreter');
const pdfDir = path.join(appDir, 'pdfs');
const csvDir = path.join(appDir, 'csvs');
const menu = [];

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

const deleteAllPdfFiles = () => {
    if (fs.existsSync(pdfDir)) {
        fs.readdirSync(pdfDir).forEach((file) => {
            const filePath = path.join(pdfDir, file);
            deleteFile(filePath);
        });
    }
}

const deleteAllCsvFiles = () => {
    if (fs.existsSync(csvDir)) {
        fs.readdirSync(csvDir).forEach((file) => {
            const filePath = path.join(csvDir, file);
            deleteFile(filePath);
        });
    }
}

const runPythonScript = () => {
    return new Promise((resolve, reject) => {
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

                resolve(pythonProcess);
            } else {
                console.error('Failed to activate virtual environment');
                reject(new Error('Failed to activate virtual environment'));
            }
        });
    })
    
};



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
    runPythonScript()
    .then((pythonProcess) => {
        pythonProcess.on('close', (code) => {
            event.reply('analysis-complete');
        });
    })
    .catch((error) => {
        console.error(error);
    })

    
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
    deleteAllPdfFiles();
});

ipcMain.on('delete-pdf', (event, fileName) => {
    const pdfPath = path.join(pdfDir, fileName);

    deleteFile(pdfPath);
});

ipcMain.on('delete-csv', (event, fileName) => {
    const csvPath = path.join(csvDir, fileName);

    deleteFile(csvPath);
});

// Function to get a list of PDF files in the temp folder
ipcMain.on('get-pdf-list', (event) => {
    let pdfFiles = [];

    if (fs.existsSync(pdfDir)) {
        pdfFiles = fs.readdirSync(pdfDir).map((file) => path.basename(file));
    }

    event.reply('pdf-list', pdfFiles);
    console.log('Sent PDF list:', pdfFiles);
});

ipcMain.on('get-csv-list', (event) => {
    let csvFiles = [];

    if (fs.existsSync(csvDir)) {
        csvFiles = fs.readdirSync(csvDir).map((file) => path.basename(file));
    }
    
    event.reply('csv-list', csvFiles);
    console.log('Sent CSV list:', csvFiles);
});

ipcMain.on('download-csv', async (event, fileName) => {
    const filePath = path.join(csvDir, fileName);
    const savePath = await dialog.showSaveDialog({
        defaultPath: fileName,
        filters: [{name: 'CSV Files', extensions: ['csv']}]
    });

    if (!savePath.canceled && savePath.filePath) {
        fs.copyFileSync(filePath, savePath.filePath);
        const message = `File saved to ${savePath.filePath}`;
        event.reply('download-success', message);
    }
});

ipcMain.on('reset', () => {
    // Implement reset logic here
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
        deleteAllPdfFiles();
        deleteAllCsvFiles();
        app.quit();
    }
    
});

