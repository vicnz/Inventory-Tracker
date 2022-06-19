const { renderer: db } = require('./app/database')
const { renderer: window_controller } = require('./app/traffic_light')
const { renderer: dialog } = require('./app/dialogs')
const { renderer } = require('./app/utils')

/**
 * * REGISTER API's to CLIENT
 */
db();
window_controller();
dialog();
renderer();