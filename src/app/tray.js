
const { Menu, Tray } = require('electron')
const { join } = require('path')

module.exports.Tray = async (tray, app, mainWindow, logger) => {
    const isProduction = app.isPackaged
    const iconPath = isProduction ? join(process.cwd(), '/resources/app/assets/favicon.ico') : join(process.cwd(), '/assets/favicon.ico')
    tray = new Tray(iconPath)
    const trayMenu = Menu.buildFromTemplate([
        {
            label: "Open App",
            click: () => {
                mainWindow.focus()
            }
        },
        { type: 'separator' },
        {
            label: "Exit",
            click: () => {
                app.quit()
            }
        }
    ])
    tray.setTitle(app.getName())
    tray.setToolTip(app.getName())
    tray.setContextMenu(trayMenu)
}