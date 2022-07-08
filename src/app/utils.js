const { contextBridge, ipcMain, app, dialog, ipcRenderer, BrowserWindow } = require('electron')
const { join, extname, basename } = require('path')
const { writeFile } = require('fs/promises')
const { randomUUID } = require('crypto')
const Paparse = require('./papaparse.min.js')
const { parseToHTML, parsetoCSV, parseToMarkdown } = require('./exports_imports')

module.exports.main = async (mainWindow, ...others) => {
    const database = others[0]; ///database reference
    /**Handle Exported Rows */
    ipcMain.handle('export-selected', async (event, data) => {
        const { type } = data;
        let filter = { name: 'CSV (Comma Separated Values)', extensions: ['csv'] }
        let fileName = "Export.csv"
        /**Determine Type of Export */
        switch (type) {
            case 'html':
                filter = { name: 'HTML (HyperText Markup Language)', extensions: ['html', 'htm'] }
                fileName = "Export.html"
                break;
            case 'markdown':
                filter = { name: 'Markdown', extensions: ['md', 'mdx'] }
                fileName = "Export.md"
                break;
            default:
                filter = { name: 'CSV (Comma Separated Values)', extensions: ['csv'] }
                fileName = "Export.csv"
                break;
        }

        let returned = await dialog.showSaveDialog(mainWindow, {
            title: "Save File",
            defaultPath: join(app.getPath("downloads"), fileName),
            filters: [
                filter
            ],
            ...data
        })
        return returned;
    })

    /**Handle Load Database File*/
    ipcMain.on('load-backup', async (event, data) => {
        const filePath = await dialog.showOpenDialog(mainWindow, {
            title: "Open Database File",
            defaultPath: app.getPath('downloads'),
            message: "Make sure the database backup selected is the right database from your previous back-ups from the same app",
            filters: [
                { name: 'Database', extensions: ['db', 'sqlite'] },
                { name: 'All File', extensions: ['*'] }
            ]
        });

        if (filePath.canceled) {
            return;
        } else {
            ///TODO check if database schema is compatible with the current app version
            const prompt = await dialog.showMessageBox(mainWindow, {
                title: "Relaunch",
                message: 'App needs to relauch to make load backup file',
                type: 'info',
                buttons: ['Ok', 'Cancel']
            })

            if (prompt.response !== 0) {
                return;
            } else {
                ///TODO
            }
        }
    });

    /**Handle Backup Database */
    ipcMain.on('backup', async (event, data) => {
        /** Fetch Current Date and Time*/
        const currentDateTime = new Date(Date.now()).toLocaleString().replace(/[/]/g, '-').replace(/[:]/g, '-').replace(/[\,\s]/g, '_');
        /**Prompt Save Path */
        const dbPath = await dialog.showSaveDialog(mainWindow, {
            defaultPath: join(app.getPath("downloads"), `backup_file_${currentDateTime}.db`),
            filters: [
                { name: 'All Files', extensions: ['*'] },
                { name: "Database", extensions: ['db', 'sqlite'] }
            ],
            title: "Create Database Backup",

        });

        if (dbPath.canceled) {
            return;
        } else {
            /**Check if File Type is Database or Sqlite */
            if (extname(dbPath.filePath) !== '.db' && extname(dbPath.filePath) !== '.sqlite') {
                dialog.showErrorBox('File Type Error', `Invalid Sqlite Database FileName \"${basename(dbPath.filePath)}\"\nMust Be \"filename.db\"`);
            } else {
                try {
                    await database.backup(dbPath.filePath) /**Proceed on Database Back Up */
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
        database.close();
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
        /**EXPORTS */
        export: async (ids, column, table, type = 'csv') => {
            /**FETCH DATA FROM TABLE */
            let result = await ipcRenderer.invoke('get-many', {
                sql: `SELECT * FROM ${table} WHERE ${column} = ?`,
                params: ids
            })

            if (result?.error) {
                return { error: result.error }
            } else {
                /**CHOOSE FILE */
                const savePath = await ipcRenderer.invoke('export-selected', { type })
                if (savePath.canceled) {
                    return;
                } else {
                    let parsedString = "";
                    const columns = Object.keys(result[0])
                    switch (type) {
                        case 'html':
                            parsedString = await parseToHTML(result, columns, `Exported to ${type.toUpperCase()}`);
                            break;
                        case 'markdown':
                            parsedString = await parseToMarkdown(result, columns, `Exported to ${type.toUpperCase()}`);
                            break;
                        default:
                            parsedString = await parsetoCSV(result, {});
                            break;
                    }

                    if (parsedString?.error) {
                        ipcRenderer.on('show-error-dialog', { title: 'Error', message: "Error Parsing Data" });
                    } else {
                        writeFile(savePath.filePath, parsedString.data).then(async () => {
                            await ipcRenderer.invoke('show-message-dialog', { type: 'info', title: 'Export Successful', message: `File was save at:\r\n📁 ${savePath.filePath}` })
                        }).catch(async error => {
                            ipcRenderer.on('show-error-dialog', { title: 'Error', message: "Error Saving File" });
                        })
                    }
                }
            }
        },
        /**BACKUP */
        backup: async () => {
            ipcRenderer.send('backup', {});
        },
        /**LOAD BACKUP */
        load: async () => {
            ipcRenderer.send('load-database', {})
        },
        /**RELAUNCH */
        relaunch: async () => {
            ipcRenderer.send('reload-window', {});
        },
        /**RELOAD */
        reload: async () => {
            ipcRenderer.send('reload-web', {})
        }
    });
}