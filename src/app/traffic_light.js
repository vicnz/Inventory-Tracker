const { app, ipcMain, ipcRenderer, contextBridge, dialog } = require('electron')

/**
 * Traffic Lights (Main)
 * [1] Minimize
 * [2] Maximize/Unmaximize
 * [3] Exit 
 */
module.exports.main = (mainWindow, app) => {
    ipcMain.on('close-window', async (event, data) => {
        const reply = await dialog.showMessageBox(mainWindow, {
            type: 'warning',
            title: 'Exit',
            message: 'Exit Application?',
            buttons: ['OK', 'Cancel']
        })
        if (reply.response === 0) app.quit();
    })
    ipcMain.on('minimize', (event, data) => {
        mainWindow.minimize(); //minimize window
    })
    ipcMain.on('maximize', (event, data) => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    })

}

/**
 * Traffic Lights (Renderer)
 * [1] Minimize
 * [2] Maximize/Unmaximize
 * [3] Exit
 */
module.exports.renderer = () => {
    contextBridge.exposeInMainWorld('controller', {
        //Minimize window
        minimize: () => ipcRenderer.send('minimize'),
        //Maximize/Unmaximize window
        maximize: () => ipcRenderer.send('maximize'),
        //Exit window
        close: () => ipcRenderer.send('close-window')
    })
}