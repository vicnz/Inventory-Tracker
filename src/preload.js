const { renderer: db } = require('./app/database')
const { renderer: window_controller } = require('./app/traffic_light')
const { renderer: dialog } = require('./app/dialogs')
const { renderer } = require('./app/utils')
const { contextBridge, ipcRenderer } = require('electron')
/**
 * * REGISTER API's to CLIENT
 */
db();
window_controller();
dialog();
renderer();

contextBridge.exposeInMainWorld('logger', {
    info: async (message) => {
        ipcRenderer.send('log-info', message)
    },
    error: async (message) => {
        ipcRenderer.send('log-error', message)
    },
    debug: async (message) => {
        ipcRenderer.send('log-debug', message)
    }
}
)