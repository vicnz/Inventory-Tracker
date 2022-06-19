const { contextBridge, ipcMain, dialog, app, ipcRenderer } = require('electron')
const { randomUUID } = require('crypto')

module.exports.main = async (mainWindow, ...others) => {
    ipcMain.handle('onsave', async (event, data) => {
        let returned = await dialog.showSaveDialog(mainWindow, {
            title: "Save File",
            message: "Save Backup File",
            defaultPath: app.getPath("documents"),
            filters: [
                { name: 'All Files', extensions: ['*'] },
                { name: 'Database', extensions: ['db', 'sqlite'] }
            ]

        })
        return returned;
    })

    ipcMain.handle('onopen', async (event, data) => {
        //TODO
        let returned = await dialog.showOpenDialog(mainWindow, {
            title: "Save File",
            message: "Save Backup File",
            defaultPath: app.getPath("documents"),
            filters: [
                { name: 'All Files', extensions: ['*'] },
                { name: 'db', extensions: ['Database', 'sqlite'] }
            ],
            properties: ['dontAddToRecent', 'promptToCreate']

        })
        return returned;
    })
}

module.exports.renderer = () => {
    contextBridge.exposeInMainWorld('utils', {
        /**?RANDOM ID GENERATOR */
        generateID: () => randomUUID(),
        /**SAVE DIALOG */
        saveDialog: async () => {
            //TODO
            let response = await ipcRenderer.invoke('onsave', {})
            console.log(response);
        },
        openDialog: async () => {
            //TODO
        }
    });
}