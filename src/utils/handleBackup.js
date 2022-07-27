//@ts-check
const { dialog, ipcRenderer } = require('electron')
const { join, extname, basename } = require('path')


// @ts-ignore
async function handleBackup(app, mainWindow, database) {
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
        // @ts-ignore
        if (extname(dbPath.filePath) !== '.db' && extname(dbPath.filePath) !== '.sqlite') {
            // @ts-ignore
            dialog.showErrorBox('File Type Error', `Invalid Sqlite Database FileName \"${basename(dbPath.filePath)}\"\nMust Be \"filename.db\"`);
        } else {
            try {
                await database.backup(dbPath.filePath) /**Proceed on Database Back Up */
                await dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: "Backup",
                    message: `📁 Backup file saved\nFile Path: ${dbPath.filePath}`
                });
            } catch (error) {
                dialog.showErrorBox('Error', 'Backup Failed');
                ipcRenderer.send('log-debug', `[main]:[handleBackup.js] Backup Failed ${error?.message}`)
            } finally {
                return;
            }
        }
    }
}

module.exports = handleBackup