const { app, BrowserWindow, ipcMain, globalShortcut, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1300,
        height: 850,
        backgroundColor: '#050505',
        show: false,
        frame: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.once('ready-to-show', () => mainWindow.show());

    // Limpieza de referencia al cerrar
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // --- ATAJO GLOBAL: ALT+M ---
    try {
        globalShortcut.register('Alt+M', () => {
            if (!mainWindow) return;
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
                mainWindow.focus();
            } else {
                mainWindow.minimize();
            }
        });
    } catch (e) {
        console.error("Error registrando atajo global:", e);
    }
}

// --- MANEJADORES DE EVENTOS NATIVOS (IPC) ---

ipcMain.on('set-opacity', (event, opacity) => {
    if (mainWindow) mainWindow.setOpacity(parseFloat(opacity));
});

ipcMain.on('save-report', (event, { name, content }) => {
    const desktopPath = path.join(app.getPath('desktop'), 'O.L.E.T_Reports');
    if (!fs.existsSync(desktopPath)) fs.mkdirSync(desktopPath);
    
    const fileName = `Report_${name}_${Date.now()}.txt`;
    const filePath = path.join(desktopPath, fileName);
    
    fs.writeFileSync(filePath, content, 'utf8');
    
    new Notification({
        title: 'O.L.E.T. Sistema de Archivos',
        body: `Expediente guardado en Escritorio/O.L.E.T_Reports`,
        silent: false
    }).show();
});

// --- GESTIÓN DE CIERRE TOTAL ---

app.whenReady().then(createWindow);

// Asegurar que la app se cierra al cerrar todas las ventanas
app.on('window-all-closed', () => {
    // Liberar todos los atajos antes de salir
    globalShortcut.unregisterAll();
    
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Forzar salida si el proceso se queda colgado
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

// Si por alguna razón la app no se cierra, forzamos la salida al terminar
app.on('quit', () => {
    process.exit(0);
});
