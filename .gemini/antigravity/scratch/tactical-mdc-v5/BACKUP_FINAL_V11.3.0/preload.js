const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nexusNative', {
    platform: process.platform,
    version: '11.2.0-Elite',
    
    // Control de Ventana
    setOpacity: (value) => ipcRenderer.send('set-opacity', value),
    
    // Sistema de Archivos
    saveReport: (name, content) => ipcRenderer.send('save-report', { name, content }),
    
    // Notificaciones e Inmersión
    sendNotification: (title, body) => {
        new Notification(title, { body });
    }
});

console.log('O.L.E.T. DESKTOP BRIDGE: OPERATIONAL');
