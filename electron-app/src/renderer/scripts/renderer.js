const dropArea = document.getElementById('drop-area');
const pdfList = document.getElementById('pdf-list');
const analyzeBtn = document.getElementById('analyze-btn');
const resetBtn = document.getElementById('reset-btn');

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
            alertError('Please submit a PDF.');
            return;
        } 

        const fileName = document.createElement('p');
        fileName.textContent = file.name;
        pdfList.appendChild(fileName);
    });
});

dropArea.addEventListener('click', () => {
    ipcRenderer.send('open-file-dialog');
});

ipcRenderer.on('selected-files', (filePaths) => {
    console.log(filePaths)
    ipcRenderer.send('save-pdfs', filePaths);

    // Display file names
    filePaths.forEach((filePath) => {
        const fileName = filePath.split('\\').pop();
        const fileNameElement = document.createElement('p');
        fileNameElement.textContent = fileName;
        pdfList.appendChild(fileNameElement);
    });
});

analyzeBtn.addEventListener('click', () => {
    const fileNames = Array.from(pdfList.children).map((child) => child.textContent);
    ipcRenderer.send('analyze-pdfs', fileNames);
    pdfList.innerHTML = '';
});

resetBtn.addEventListener('click', () => {
    pdfList.innerHTML = '';
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