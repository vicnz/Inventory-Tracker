// const {utils: {fromBuildIdentifier}} = require('@electron-forge/core')
const { mkdirSync, copyFileSync, existsSync, lstatSync, readdirSync, openSync, closeSync } = require('fs')
const { join } = require('path')

const { exec } = require('child_process')
/**GENERATING DATABASE */
// const Database = require('better-sqlite3')
const { ignoreLists } = require('./forge.utils')

module.exports = {
    packagerConfig: {
        appBundleId: "com.app.nz",
        name: "Inventory Tracker",
        icon: "./assets/favicon.ico",
        ignore: ignoreLists,
        asar: false
    },
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                name: "electron_app"
            }
        },
        /**
         * * WINDOWS ONLY FOR THE MEAN TIME
         */
        // {
        //     name: "@electron-forge/maker-zip",
        //     platforms: [
        //         "darwin"
        //     ]
        // },
        // {
        //     name: "@electron-forge/maker-deb",
        //     config: {}
        // },
        // {
        //     name: "@electron-forge/maker-rpm",
        //     config: {}
        // }
    ],
    hooks: {
        //generate assets
        generateAssets: async (forgeConfig, platform, arch) => {
<<<<<<< HEAD
            console.log('\n🕑 Generating Assets...\n')
=======
            console.log('\n🕑 generating assets\n')
>>>>>>> master
            if (!existsSync(join(__dirname, '/assets/'))) {
                mkdirSync(join(__dirname, '/assets/'))
            }
            console.log(`📦 Initializing Database...`)
            copyFileSync(join(__dirname, `app.dev.db`), join(__dirname, '/assets/app.db')) // copy database file
            // initDatabase(); /**INITIALIZE DATABASE */
            console.log(`🪟  Building Client UI...`)
            exec(`cd client_ui && npm run build`, (error) => { if (error) console.log(error) });
            copyFolder(join(__dirname, 'client_ui/dist'), join(__dirname, 'assets/ui'))
            copyFileSync(join(__dirname, `logo.ico`), join(__dirname, 'assets/favicon.ico')) //copy app icon
        }
    }
}


/**COPY FOLDER DIST */
function copyFolder(from, to) {
    if (!existsSync(to)) {
        mkdirSync(to)
        readdirSync(from).forEach(item => {
            if (lstatSync(join(from, item)).isFile()) {
                copyFileSync(join(from, item), join(to, item))
            } else {
                copyFolder(join(from, item), join(to, item))
            }
        })
    }
}

/**
 * CREATE DATABASE FILE TODO Build Differently
 * @param {any} database
 */
// function initDatabase() {
//     closeSync(openSync(join(__dirname, '/assets/app.db'))); /**CREATE DATABASE FILE */
//     const path = join(__dirname, 'assets/app.db')
//     let database = new Database(path)

//     /**CREATE QUERY */
//     create(database, createStatements)
//     database.close()
// }
