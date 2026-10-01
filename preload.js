const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	printReport: (html, pageSize) => ipcRenderer.invoke('lab:print-report', { html, pageSize })
});