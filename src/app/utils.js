const { contextBridge, ipcMain, app, dialog, ipcRenderer } = require('electron')
const { join } = require('path')
const { writeFile } = require('fs/promises')
const { randomUUID } = require('crypto')
const Paparse = require('./papaparse.min.js')

module.exports.main = async (mainWindow, ...others) => {
    ipcMain.handle('save', async (event, data) => {
        let returned = await dialog.showSaveDialog(mainWindow, {
            title: "Save File",
            defaultPath: app.getPath("downloads"),
            filters: [
                { name: "All Files", extensions: ["*"] },
                { name: "CSV (Comma Delimited Values)", extensions: ["csv"] }
            ],
            ...data
        })
        return returned;
    })
}

module.exports.renderer = () => {
    contextBridge.exposeInMainWorld('utils', {
        /**?RANDOM ID GENERATOR */
        generateID: () => randomUUID(),
        export: async (ids, column, table) => {
            /**FETCH DATA FROM TABLE */
            let result = await ipcRenderer.invoke('get-many', {
                sql: `SELECT * FROM ${table} WHERE ${column} = ?`,
                params: ids
            })

            if (result?.error) {
                return { error: result.error }
            } else {
                /**CHOOSE FILE */
                const savePath = await ipcRenderer.invoke('save', {})
                if (savePath.canceled) {
                    return;
                } else {
                    let parsed = Paparse.unparse(result, {})
                    writeFile(savePath.filePath, parsed).then(async () => {
                        await ipcRenderer.invoke('show-message-dialog', { type: 'info', title: 'Export Successful', message: `File was save at ${savePath.filePath}` })
                    }).catch(async error => {
                        await ipcRenderer.on('show-error-dialog', { title: 'Error', message: "Error Saving File" });
                    })
                }
            }
        }
    });
}