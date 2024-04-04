const dropArea = document.getElementById('drop-area');
const pdfList = document.getElementById('pdf-list');
const csvList = document.getElementById('csv-list');
const analyzeBtn = document.getElementById('analyze-btn');
const resetBtn = document.getElementById('reset-btn');
const homeScreen = document.getElementById('home-screen');
const resultsScreen = document.getElementById('results-screen');
const backBtn = document.getElementById('back-btn');

console.log('APP LOADED')
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
    deleteButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
</svg>
`;
    deleteButton.classList.add('delete-button', 'text-white', 'px-2', 'py-1', 'rounded-lg', 'hover:bg-gray-600');
    deleteButton.addEventListener('click', () => {
        pdfList.removeChild(entryContainer);
        deletePdf(fileName);
    });
    entryContainer.appendChild(deleteButton);
    return entryContainer
};

const csvEntry = (fileName) => {
    const entryContainer = document.createElement('div');
    entryContainer.classList.add('flex', 'justify-between', 'items-center');

    const fileNameElement = document.createElement('p');
    fileNameElement.textContent = fileName;
    fileNameElement.classList.add('p-2', 'bg-gray-800', 'rounded', 'flex-grow', 'mr-2', 'overflow-hidden');
    entryContainer.appendChild(fileNameElement);

    const downloadBtn = document.createElement('button');
    downloadBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-down" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M3.5 10a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 0 0 1h2A1.5 1.5 0 0 0 14 9.5v-8A1.5 1.5 0 0 0 12.5 0h-9A1.5 1.5 0 0 0 2 1.5v8A1.5 1.5 0 0 0 3.5 11h2a.5.5 0 0 0 0-1z"/>
    <path fill-rule="evenodd" d="M7.646 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V5.5a.5.5 0 0 0-1 0v8.793l-2.146-2.147a.5.5 0 0 0-.708.708z"/>
  </svg>`;
    downloadBtn.classList.add('text-white', 'px-2', 'py-2', 'rounded-lg', 'hover:bg-blue-600');
    downloadBtn.addEventListener('click', () => {
        ipcRenderer.send('download-csv', fileName);
    });

    
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

ipcRenderer.on('analysis-complete', () => {
    ipcRenderer.send('get-csv-list');
    homeScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
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
});

backBtn.addEventListener('click', () => {
    csvList.innerHTML = '';
    pdfList.innerHTML = '';
    resultsScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    ipcRenderer.send('reset');
});

resetBtn.addEventListener('click', () => {
    pdfList.innerHTML = '';
    ipcRenderer.send('reset-pdfs');
});