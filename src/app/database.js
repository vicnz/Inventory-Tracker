const { ipcMain, dialog, contextBridge } = require("electron")
const { join } = require('path')

//utils
const Dashboard = require('./database/dashboard')
const Inventory = require('./database/inventory');
const Imports = require('./database/imports');
const Exports = require('./database/exports');
const Others = require('./database/others')
const Category = require('./database/categories')
const Warehouses = require('./database/warehouse')
const Clients = require('./database/clients')

module.exports.main = (mainWindow, app, database) => {
    /**SELECT */
    ipcMain.handle('all', (event, data) => {
        let { sql, params = [] } = data;
        try {
            const stmt = database.prepare(sql);
            let result = stmt.all(params);
            return { data: result }
        } catch (err) {
            return { error: err }
        }
    })

    /**SELECT ONE */
    ipcMain.handle('get', (event, data) => {
        let { sql, params } = data;
        try {
            const stmt = database.prepare(sql)
            const result = stmt.get(params)
            return result;
        } catch (err) {
            return { error: err }
        }
    })

    /**INSERT */
    ipcMain.handle('insert', (event, data) => {
        /**
         * PARAM PATTERN
         * INSERT INTO dictionary (word, desc) VALUES (:word, :desc);
         */
        const { sql, params } = data;
        try {
            const stmt = database.prepare(sql);
            const insertMany = database.transaction(paramItems => {
                for (const item of paramItems) {
                    stmt.run(item)
                }
            });
            const result = insertMany([...params]);
            return result;
        } catch (err) {
            return { error: err }
        }
    })

    /**UPDATE */
    ipcMain.handle('update', (event, data) => {
        const { sql, params } = data;
        try {
            const stmt = database.prepare(sql);
            const updateMany = database.transaction((paramItem) => {
                for (const item of paramItem) stmt.run(item);
            })
            const result = updateMany(params)
            return result
        } catch (err) {
            return { error: err }
        }
    })

    /**DELETE */
    ipcMain.handle('delete', (event, data) => {
        const { sql, params } = data;
        try {
            const stmt = database.prepare(sql)
            const deleteMany = database.transaction((paramItem) => {
                for (const item of paramItem) stmt.run(item);
            })
            const result = deleteMany(params)
            return result;
        } catch (err) {
            return { error: err }
        }
    })

    //handle back-ups
    ipcMain.handle('back-up', (event, data) => {
        const { path } = data
        const fullFilePath = join(path, `/database-backup-${Date.now()}.db`)

        database.backup(fullFilePath)
            .then(() => {
                dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: 'Success',
                    message: `Backup Saved in ${fullFilePath}`,
                    detail: 'Backup Complete',
                })
            }).catch((err) => {
                dialog.showErrorBox('Failed', 'Backup Failed')
            })
    })
}

//RENDERER
module.exports.renderer = function () {
    contextBridge.exposeInMainWorld('dashboard', Dashboard())
    contextBridge.exposeInMainWorld('inventory', Inventory())
    contextBridge.exposeInMainWorld('categories', Category())
    contextBridge.exposeInMainWorld('warehouses', Warehouses())
    contextBridge.exposeInMainWorld('imports', Imports())
    contextBridge.exposeInMainWorld('exports', Exports())
    contextBridge.exposeInMainWorld('others', Others())
    contextBridge.exposeInMainWorld('clients', Clients())
}
