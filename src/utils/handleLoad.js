const { join } = require('path')
const { copyFile } = require('fs/promises')
const { dialog } = require('electron')
const Database = require('better-sqlite3')
/**CHANGE DB ENTITIES IF THERE IS A CHANGE IN DB SCHEMA */
const { DATABASE_ENTITIES } = require('../_constants')

/**
 * MAIN PROCESS
 */

/**
 * handleLoadingDbMain
 * Load Database File
 * @param {Electron.App} app 
 * @param {Electron.BrowserWindow} mainWindow 
 * @param {Sqlite} database 
 * @returns void
 */
module.exports = async function handleLoadingDbMain(app, mainWindow, database) {
    const destinationPath = join(app.getPath('userData'), "app.db") //get db destination filepath

    const prompt = await dialog.showOpenDialog(mainWindow, {
        title: "Select Backup File",
        properties: ["openFile"],
        message: "Make sure that the Backup File originate from the same App",
        defaultPath: app.getPath('downloads'),
        filters: [{ name: 'Database File/SQLite', extensions: ['db', 'sqlite'] }]
    })

    if (prompt.canceled) {
        return;
    } else {

        const dbFile = prompt?.filePaths[0]
        //check database schema entity count
        const testDatabase = new Database(dbFile, { readonly: true })
        const stmt = testDatabase.prepare(testDatabaseSchema)
        const result = stmt.all()
        testDatabase.close() //close after reading

        if (result.length < 1) {
            //Database Entities are incompatible
            dialog.showErrorBox("Error", "⚠️ Database File May Be Empty Or is not a Backup file from this App")
        } else {
            const { tables, triggers, views } = result[0]
            if (tables !== DATABASE_ENTITIES.tables && views !== DATABASE_ENTITIES.views && triggers !== DATABASE_ENTITIES.triggers) {
                dialog.showErrorBox("Incompatible", "⚠️ Database backup version is incompatible with the current version")
            } else {
                const promptChange = await dialog.showMessageBox(mainWindow, { title: 'Reload Windows', message: "App needs to restart to load database file.", buttons: ['Restart', 'Cancel'] })
                if (promptChange.response === 0) {
                    //Load database to destination
                    database.close(); //close database first
                    copyFile(prompt.filePaths[0], destinationPath); //copy to data path folder
                    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) }) //relaunch app
                    app.exit(0);
                } else {
                    return;
                }
            }
        }
    }
}

/**DB Schema used to check the database structure */
const testDatabaseSchema = `
SELECT 
    (
        SELECT
            COUNT(name)
        FROM sqlite_master
        WHERE name IN (
            'categories',
            'clients',
            'ingoing',
            'ingoing_discarded',
            'outgoing_discarded',
            'outgoing',
            'ingoing',
            'master',
            'warehouses',
            'master_discarded'
        )
    ) as tables,
    ---VIEWS
    (
        SELECT
            COUNT(name)
        FROM sqlite_master
        WHERE name IN (
            'inventory',
            'ingoing_view',
            'outgoing_view',
            'clients_supplier',
            'clients_customer',
            'category_items',
            'warehouse_items',
            'product_list',
            'ingoing_arrived_view',
            'outgoing_arrived_view',
            'inventory_summary',
            'ingoing_summary',
            'outgoing_summary'
        )
    ) as views,
    ---TRIGGERS
    (
        SELECT
            COUNT(name)
        FROM sqlite_master
        WHERE name IN (
            'on_ingoing_checked',
            'on_outgoing_checked',
            'on_master_item_updated',
            'category_on_update',
            'warehouse_on_update',
            'clients_on_update',
            'ingoing_on_delete',
            'outgoing_on_delete',
            'master_on_delete'
        )
    ) as triggers
FROM sqlite_master LIMIT 1;
`