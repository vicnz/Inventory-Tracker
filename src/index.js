//@ts-check

const { app, BrowserWindow, ipcMain } = require('electron');
const serveStatic = require('serve-static')
const Database = require('better-sqlite3');
/**NODE Modules */
const path = require('path');
const http = require('http')
const { copyFileSync } = require('fs')
const { stat } = require('fs/promises')
/**COMPONENTS*/
const logger = require('./utils/logger').Logger
const { UI_PATH } = require('./_constants')
const { main: trafficLights, } = require('./app/traffic_light')
const { main: mainDialogs } = require('./app/dialogs')
const { main: db } = require('./app/database');
const { main: utils } = require('./app/utils')
//BUGGY CODE
// const { Tray } = require('../src/app/tray')

/**WINDOWS SPECIFIC */
if (require('electron-squirrel-startup')) {
    app.quit();
}

/**CONSTANTS */
const isProduction = app.isPackaged;
let database = null;

/**MAIN APP*/
let mainWindow = null; //Window Reference
let server = null; //Server Reference
let clientRendererPath = isProduction ? UI_PATH : path.join(__dirname, '/client_ui');

const serve = serveStatic(clientRendererPath, { index: ['index.html'] }) // * Serve static
const setSingleLock = app.requestSingleInstanceLock()
const createWindow = async () => {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        frame: false,
        minWidth: 450,
        minHeight: 300,
        center: true,
        roundedCorners: true,
        webPreferences: {
            textAreasAreResizable: false,
            preload: isProduction ? path.join(process.cwd(), '/resources/app/src/preload.js') : path.join(__dirname, '/preload.js'),
        }
    });

    if (isProduction) {
        mainWindow.loadURL(`http://localhost:${server?.address()?.port}`);
    } else {
        mainWindow.loadURL('http://localhost:5000');
        mainWindow.webContents.openDevTools();
    }

    /**BUGGY CODE */
    // await Tray(app, mainWindow, logger);

    /**
     * ?IPCMAIN HANDLERS
     */

    /**TRAFFIC LIGHTS */
    trafficLights(mainWindow, app);
    /**DIALOGS */
    mainDialogs(mainWindow);
    /**DATABASE */
    db(mainWindow, app, database);
    /**UTILS */
    utils(mainWindow, database)

    /**
     * * HANDLE LOGS
    */
    ipcMain.on('log-info', (event, data) => {
        logger.info(`${data}`)
    });
    ipcMain.on('log-error', (event, data) => {
        logger.error(`${data}`)
    });
    ipcMain.on('log-debug', (event, data) => {
        logger.debug(`${data}`)
    });
};

/**INITIALIZE APP */
async function initApp() {
    /**
     * ? CREATE DATABASE
     */
    if (isProduction) {
        try {
            /**USER DATABASE IF IT ALREADY EXISTS */
            await stat(path.join(app.getPath('userData'), 'app.db'))
            database = new Database(path.join(app.getPath('userData'), 'app.db'))
        } catch (err) {
            /**COPY TEMPLATE DATABASE IF DB DOES NOT EXISTS YET */
            logger.info('Database Does Not exist in User Director, Creating Database')
            copyFileSync(path.join(process.cwd(), '/resources/app/assets/app.db'), path.join(app.getPath('userData'), 'app.db'))
            database = new Database(path.join(app.getPath('userData'), 'app.db'))
        }
    } else {
        database = new Database(path.join(process.cwd(), 'app.test.db'), { verbose: console.log })
    }

    /**CREATE SERVER AND DATABASE (Production) */
    if (isProduction) {
        server = http.createServer((request, response) => {
            serve(request, response)
        })
        server.listen(0, (err) => {
            logger.error(`[main]:[index.js] Failed To Start Server, ${err?.message}`)
        }).on('listening', () => {
            logger.info(`[main]:[index.js] Client Server Started At Port ${server.address().port}`)
        })
    }
    createWindow()
}

/**
 *? CREATE WINDOW
 */

if (!setSingleLock) {
    app.quit();
} else {
    app.on('second-instance', (e, cmdLine, workingDir) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })
}

app.on('ready', async () => {
    await initApp()
});

app.on('before-quit', () => {
    //close database and page server on app exit
    if (isProduction) {
        server?.close();
    }
    database?.close();
})



//MACOS "Darwin" Specific Closing
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (isProduction) {
            server?.close();
        }
        database?.close();
        app.quit();
    }
});


app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        await initApp()
    }
});



