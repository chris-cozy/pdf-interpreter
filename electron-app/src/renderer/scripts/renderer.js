const dropArea = document.getElementById('drop-area');
const pdfList = document.getElementById('pdf-list');
const csvList = document.getElementById('csv-list');
const analyzeBtn = document.getElementById('analyze-btn');
const resetBtn = document.getElementById('reset-btn');
const homeScreen = document.getElementById('home-screen');
const resultsScreen = document.getElementById('results-screen');
const backBtn = document.getElementById('back-btn');


const deletePdf = (filePath) => {
    ipcRenderer.send('delete-pdf', filePath);
};

const pdfEntry = (fileName) => {
    const entryContainer = document.createElement('div');
    entryContainer.classList.add('flex', 'justify-between', 'items-center', 'mb-2');

    const fileNameElement = document.createElement('p');
    fileNameElement.textContent = fileName;
    fileNameElement.classList.add('p-2', 'bg-gray-800', 'rounded', 'flex-grow', 'mr-2', 'overflow-hidden');
    entryContainer.appendChild(fileNameElement);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-button', 'bg-gray-500', 'text-white', 'px-2', 'py-1', 'rounded-lg', 'hover:bg-gray-600');
    deleteButton.addEventListener('click', () => {
        pdfList.removeChild(entryContainer);
        deletePdf(fileName);
    });
    entryContainer.appendChild(deleteButton);
    return entryContainer
};

const csvEntry = (fileName) => {
    const entryContainer = document.createElement('div');
    entryContainer.classList.add('bg-gray-800', 'p-4', 'rounded', 'shadow');

    const csvName = document.createElement('h2');
    csvName.textContent = fileName;

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download';
    downloadBtn.classList.add('bg-blue-500', 'text-white', 'px-4', 'py-2', 'rounded', 'hover:bg-blue-600', 'mr-4');
    downloadBtn.addEventListener('click', () => {
        ipcRenderer.send('download-csv', fileName);
    });

    entryContainer.appendChild(csvName);
    entryContainer.appendChild(downloadBtn);
    return entryContainer;
};

const isPdf = (file) => {
    return file.type === 'application/pdf';
};

const alertError = (message) => {
    Toastify.toast({
        text: message,
        duration: 3000,
        close: false,
        style: {
            background: "#ff5252",
            color: "#ffffff",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
        }
    });
};

const alertSuccess = (message) => {
    Toastify.toast({
        text: message,
        duration: 3000,
        close: false,
        style: {
            background: "#4caf50",
            color: "#ffffff",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
        }
    });
};

ipcRenderer.send('get-pdf-list');

ipcRenderer.on('download-success', (message) => {
    alertSuccess(message);
})

ipcRenderer.on('pdf-list', (pdfFiles) => {
    if (!pdfFiles) return;
    pdfFiles.forEach((fileName) => {
        const entry = pdfEntry(fileName);
        pdfList.appendChild(entry);
    })
})

ipcRenderer.on('csv-list', (csvFiles) => {
    if (!csvFiles) return;
    csvFiles.forEach((fileName) => {
        const entry = csvEntry(fileName);
        csvList.appendChild(entry);
    })
});

ipcRenderer.on('selected-files', (filePaths) => {
    ipcRenderer.send('save-pdfs', filePaths);

    filePaths.forEach((filePath) => {
        const fileName = path.basename(filePath);
        const entry = pdfEntry(fileName);
        pdfList.appendChild(entry);
    });
});

dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('border-blue-500');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('border-blue-500');
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.classList.remove('border-blue-500');

    const files = Array.from(event.dataTransfer.files);

    const pdfPaths = files.filter(isPdf).map((file) => file.path);
    ipcRenderer.send('save-pdfs', pdfPaths);

    files.forEach((file) => {
        if (!isPdf(file)) {
            alertError('Only PDF files are accepted');
            return;
        } 

        const entry = pdfEntry(file.name);

        pdfList.appendChild(entry);

    });
});

dropArea.addEventListener('click', () => {
    ipcRenderer.send('open-file-dialog');
});


analyzeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const fileNames = Array.from(pdfList.children).map((child) => child.textContent);
    ipcRenderer.send('analyze-pdfs', fileNames);
    pdfList.innerHTML = '';

    ipcRenderer.send('reset-pdfs');
});

ipcRenderer.on('analysis-complete', () => {
    ipcRenderer.send('get-csv-list');
    homeScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
});

backBtn.addEventListener('click', () => {
    resultsScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    ipcRenderer.send('reset');
});

resetBtn.addEventListener('click', () => {
    pdfList.innerHTML = '';
    ipcRenderer.send('reset-pdfs');
});