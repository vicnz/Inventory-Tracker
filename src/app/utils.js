const { contextBridge, ipcMain, app, dialog, ipcRenderer, BrowserWindow } = require('electron')
const { join, extname, basename } = require('path')
const { writeFile } = require('fs/promises')
const { randomUUID } = require('crypto')
const Paparse = require('./papaparse.min.js')

module.exports.main = async (mainWindow, ...others) => {
    /**Handle Exported Rows */
    ipcMain.handle('export-selected', async (event, data) => {
        let returned = await dialog.showSaveDialog(mainWindow, {
            title: "Save File",
            defaultPath: join(app.getPath("downloads"), 'Exported.csv'),
            filters: [
                { name: "All Files", extensions: ["*"] },
                { name: "CSV (Comma Delimited Values)", extensions: ["csv"] }
            ],
            ...data
        })
        return returned;
    })
    /**Handle Load Database File*/

    /**Handle Backup Database */
    ipcMain.on('backup', async (event, data) => {
        const currentDateTime = new Date(Date.now()).toLocaleString().replace(/[/]/g, '-').replace(/[:]/g, '-').replace(/[\,\s]/g, '_');
        const dbPath = await dialog.showSaveDialog(mainWindow, {
            defaultPath: join(app.getPath("downloads"), `backup_file_${currentDateTime}.db`),
            filters: [
                { name: 'All Files', extensions: ['*'] },
                { name: "Database", extensions: ['db'] }
            ],
            title: "Create Database Backup",

        });

        if (dbPath.canceled) {
            return;
        } else {
            const database = others[0]
            if (extname(dbPath.filePath) != '.db') {
                dialog.showErrorBox('File Type Error', `Invalid Sqlite Database FileName \"${basename(dbPath.filePath)}\"\nMust Be \"filename.db\"`);
            } else {
                try {
                    await database.backup(dbPath.filePath)
                    await dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: "Backup",
                        message: `Backup file saved\nFile Path: ${dbPath.filePath}`
                    });
                } catch (error) {
                    dialog.showErrorBox('Error', 'Backup Failed');
                } finally {
                    return;
                }
            }
        }
    })

    //relaunch app
    ipcMain.on('reload-window', (event, data) => {
        app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
        others[0].close();
        app.exit(0);
    })

    //reload web ui
    ipcMain.on('reload-web', (event, data) => {
        console.log(mainWindow)
        mainWindow?.webContents?.reload();
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
                const savePath = await ipcRenderer.invoke('export-selected', {})
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
        },
        backup: async () => {
            ipcRenderer.send('backup', {});
        },
        relaunch: async () => {
            ipcRenderer.send('reload-window', {});
        },
        reload: async () => {
            ipcRenderer.send('reload-web', {})
        }
    });
}