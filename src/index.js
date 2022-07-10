const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const http = require('http')
const serveStatic = require('serve-static')
const Database = require('better-sqlite3');
/**COMPONENTS*/
const { main: trafficLights, main } = require('./app/traffic_light')
const { main: mainDialogs } = require('./app/dialogs')
const { main: db } = require('./app/database');
const { main: utils } = require('./app/utils')

/**WINDOWS SPECIFIC */
if (require('electron-squirrel-startup')) {
    app.quit();
}

/**CONSTANTS */
const isProduction = app.isPackaged;
const databasePath = isProduction ? path.join(process.cwd(), '/resources/app/assets/app.db') : path.join(process.cwd(), '/app.test.db');
let database = null;

/**MAIN APP*/
let mainWindow = null;
let server = null;
let clientRendererPath = isProduction ? path.join(process.cwd(), '/resources/app/assets/ui') : path.join(__dirname, '/client_ui');
const serve = serveStatic(clientRendererPath, { index: ['index.html'] }) // * Serve static

const createWindow = async () => {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        frame: false,
        minWidth: 450,
        minHeight: 300,
        webPreferences: {
            textAreasAreResizable: false,
            preload: isProduction ? path.join(process.cwd(), '/resources/app/src/preload.js') : path.join(__dirname, '/preload.js'),
        }
    });
    mainWindow.loadURL(path.join(__dirname, 'index.html'))
    /**INITIALIZE WINDOW */
    if (isProduction) {
        mainWindow.loadURL('http://localhost:9080');
        // mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadURL('http://localhost:5000');
        mainWindow.webContents.openDevTools();
    }
    /**TRAFFIC LIGHTS */
    trafficLights(mainWindow, app);
    /**DIALOGS */
    mainDialogs(mainWindow);
    /**DATABASE */
    db(mainWindow, app, database);
    /**UTILS */
    utils(mainWindow, database)
};

/**
 * CREATE WINDOW
 */
app.on('ready', async () => {
    /**CREATE DATABASE */
    if (isProduction) {
        database = new Database(databasePath);
    } else {
        database = new Database(databasePath, { verbose: console.log });
    }
    /**CREATE SERVER (Production) */
    if (isProduction) {
        server = http.createServer((request, response) => {
            serve(request, response)
        })
        server.listen(9080, (err) => {
            if (err) console.error(err)
        })
    }
    createWindow()
});

app.on('before-quit', () => {
    if (isProduction) {
        server?.close();
    }
    database?.close();
})



//MACOS Specific
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        database?.close();
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

