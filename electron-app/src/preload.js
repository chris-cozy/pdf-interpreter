const {contextBridge, ipcRenderer} = require('electron');
const Toastify = require('toastify-js');
const path = require('path');

contextBridge.exposeInMainWorld('path', {
  basename: (filepath) => path.basename(filepath),
})

contextBridge.exposeInMainWorld('Toastify', {
    toast: (options) => Toastify(options).showToast(),
  })

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  })