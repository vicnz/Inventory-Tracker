const { dialog, ipcMain, ipcRenderer, contextBridge, app } = require('electron')

/**
 * DIALOGS
 * exposed in Main -> Client
 */
module.exports.main = (window) => {
    /**
     * @SHOW ERROR BOX
     */
    ipcMain.on('show-error-dialog', (event, data = { title: 'Default Title', message: 'Default Message' }) => {
        dialog.showErrorBox(data.title, data.message);
    })
    /**
     * @SHOW MESSAGE BOX
     */
    ipcMain.handle('show-message-dialog', async (event, data) => {
        return await dialog.showMessageBox(window, {
            ...data
        })
    })
    /**
     * @SHOW OPEN DIALOG
     */
    ipcMain.handle('show-open-dialog', async (event, data) => {
        const options = {
            ...data,
            defaultPath: data.path,
            filters: [...data.filters],
            title: data.title,
            message: data.message
        }
        const response = await dialog.showOpenDialog(window, options)
        return response.canceled ? null : response.filePaths
    })
    /**
     * @SHOW SAVE DIALOG
     */
    ipcMain.handle('show-save-dialog', async (event, data) => {
        const options = {
            ...data,
            title: data.title,
            message: data.message,
            defaultPath: data.defaultPath,
            filters: [...data.filters]
        }
        const response = await dialog.showSaveDialog(window, options)
        return response.canceled ? null : response.filePaths
    })
}

/**
 * DIALOGS
 * exposed to Client -> Main
 */
module.exports.renderer = () => {
    contextBridge.exposeInMainWorld('dialogs', {
        /**
         * * ERROR MESSAGE
         * @param {{title: string, message: string}} param0 
         * @returns 
         */
        error: ({ title, message }) => ipcRenderer.send('show-error-dialog', { title, message }),
        /**
         * * MESSAGE DIALOG WITH PROMPT
         * @param {{*}} props 
         * @returns 
         */
        message: async (props) => {
            const info = {
                ...props,
                type: props.type || 'info',
                title: props.title || '',
                message: props.message || '',
                detail: props.detail || '',
                buttons: props.buttons || [],
                cancelId: props.cancelId || undefined,
                checkboxChecked: props.checkboxChecked || false,
                checkboxLabel: props.checkboxLabel || '',
                icon: props.icon || ''
            }
            return await ipcRenderer.invoke('show-message-dialog', { ...info });
        },
        openDialog: async () => {
            //TODO
        },
        saveDialog: async () => {
            //TODO
        }
    })
}