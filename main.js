const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const PRINT_PAGE_SIZES = {
  A4: { width: 210000, height: 297000 },
  A5: { width: 148000, height: 210000 }
};

ipcMain.handle('lab:print-report', async (_event, { html, pageSize }) => {
  const paperSize = PRINT_PAGE_SIZES[pageSize];
  if (typeof html !== 'string' || !paperSize) {
    throw new TypeError('A report and supported page size are required.');
  }

  const printWindow = new BrowserWindow({
    show: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  try {
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`, {
      baseURLForDataURL: pathToFileURL(`${app.getAppPath()}${path.sep}`).href
    });
    await printWindow.webContents.executeJavaScript('document.fonts.ready');
    return await new Promise(resolve => {
      printWindow.webContents.print({
        silent: false,
        printBackground: true,
        pageSize: paperSize,
        margins: { marginType: 'none' }
      }, (success, failureReason) => {
        if (!printWindow.isDestroyed()) printWindow.close();
        resolve({ success, failureReason: failureReason || null });
      });
    });
  } catch (error) {
    if (!printWindow.isDestroyed()) printWindow.close();
    throw error;
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#f0f4f8',
    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});