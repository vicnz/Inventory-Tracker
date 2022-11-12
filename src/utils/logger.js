//@ts-check
const { createWriteStream } = require('fs')
const { join } = require('path')
const { app } = require('electron')
/**
 * LOGGER FILE
 */
const logDir = app.getPath('logs')
let Logger = (exports.Logger = {})

let infoStream = createWriteStream(join(logDir, 'inventory.info.log.txt'))
let errorStream = createWriteStream(join(logDir, 'inventory.error.log.txt'))
let debugStream = createWriteStream(join(logDir, 'inventory.debug.log.txt'))

Logger.info = (message) => {
    let text = `${new Date().toISOString()} : ${message}\n`
    infoStream.write(text)
}

Logger.error = (message) => {
    let text = `${new Date().toISOString()} : ${message}\n`
    errorStream.write(text)
}

Logger.debug = (message) => {
    let text = `${new Date().toISOString()} : ${message}\n`
    debugStream.write(text)
}