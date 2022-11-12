const { contextBridge, ipcMain, app, ipcRenderer } = require('electron')
const { randomUUID } = require('crypto')
//utils
const { promptSaveFile } = require('../utils/handleExports')
const handleBackup = require('../utils/handleBackup')
const handleLoad = require('../utils/handleLoad')

/**EXPOSED TO MAIN PROCESS */

module.exports.main = async (mainWindow, database) => {

    /**Handle Exported Rows */
    ipcMain.on('export-selected', async (event, data) => {
        await promptSaveFile(app, mainWindow, data.type, data.content);
    })

    /**Handle Load Database File*/
    ipcMain.on('load-backup', async (event, data) => {
        await handleLoad(app, mainWindow, database)
    });

    /**Handle Backup Database */
    ipcMain.on('backup', async (event, data) => {
        await handleBackup(app, mainWindow, database)
    })
}


/**
 * @EXPOSED TO CLIENT
 */
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
                ipcRenderer.send('show-error-dialog', { title: 'Database Error', message: 'Export Data Fetching Failed' })
            } else {
                const columns = Object.keys(result[0])
                ipcRenderer.send('export-selected', { type, content: { columns, rows: result } })
            }
        },

        /**BACKUP */
        backup: async () => {
            ipcRenderer.send('backup', {});
        },

        /**LOAD BACKUP */
        load: async () => {
            ipcRenderer.send('load-backup', {})
        },
    });
}
