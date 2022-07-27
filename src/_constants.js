const { join } = require('path')
/**
 * DATABASE ENTITIES
 * @ UPDATE THIS IF THERE IS A NEW SCHEMA MODIFICATION
 */
module.exports.DATABASE_ENTITIES = {
    version: 1,
    views: 13,
    tables: 9,
    triggers: 9
}

/**DB HOSTS */
module.exports.HOSTS = {
    dev: 'http://localhost:5000',
    prod: 'http://localhost:9080'
}

/**UI PATH */
module.exports.UI_PATH = join(process.cwd(), '/resources/app/assets/ui')

/**RESOURCE PATH */
module.exports.RESOURCE_PATH = {
    dev: process.cwd(),
    prod: join(process.cwd(), '/resources/app')
}

