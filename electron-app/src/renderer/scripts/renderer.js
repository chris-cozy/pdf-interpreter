const dropArea = document.getElementById('drop-area');
const pdfList = document.getElementById('pdf-list');
const analyzeBtn = document.getElementById('analyze-btn');
const resetBtn = document.getElementById('reset-btn');

// Function to delete a PDF file
const deletePdf = (filePath) => {
    ipcRenderer.send('delete-pdf', filePath);
};

const pdfEntry = (fileName) => {
    const entryContainer = document.createElement('div');
    entryContainer.classList.add('flex', 'justify-between', 'items-center', 'mb-2');

    // Create a paragraph element for the file name
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
}

ipcRenderer.send('get-pdf-list');

ipcRenderer.on('pdf-list', (event, pdfFiles) => {
    if (!pdfFiles) return;
    pdfFiles.forEach((filePath) => {
        const fileName = path.basename(filePath);
        const entry = pdfEntry(fileName);
        pdfList.appendChild(entry);
    })
})

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

    // Send paths to main process
    const pdfPaths = files.filter(isPdf).map((file) => file.path);
    ipcRenderer.send('save-pdfs', pdfPaths);

    // Display file names
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

ipcRenderer.on('selected-files', (filePaths) => {
    ipcRenderer.send('save-pdfs', filePaths);

    // Display file names
    filePaths.forEach((filePath) => {
        const fileName = path.basename(filePath);

        const entry = pdfEntry(fileName);

        pdfList.appendChild(entry);
    });
});

analyzeBtn.addEventListener('click', () => {
    const fileNames = Array.from(pdfList.children).map((child) => child.textContent);
    ipcRenderer.send('analyze-pdfs', fileNames);
    pdfList.innerHTML = '';
});

resetBtn.addEventListener('click', () => {
    pdfList.innerHTML = '';
    ipcRenderer.send('reset-pdfs');
});

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