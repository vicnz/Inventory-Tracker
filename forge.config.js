const { mkdirSync, copyFileSync, existsSync, lstatSync, readdirSync, rmSync } = require('fs')
const { join } = require('path')

const { execSync } = require('child_process')
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
        prePackage: async (forgeConfig, platform, arch) => {
            console.log('\n🕑 Building Assets\n')
            if (existsSync(join(__dirname, 'assets/'))) {
                rmSync(join(__dirname, 'assets/'), { recursive: true, force: true })
                mkdirSync(join(__dirname, 'assets/'))
            } else {
                mkdirSync(join(__dirname, 'assets/'))
            }
            console.log("✔️  Assets Folder Creation...")

            copyFileSync(join(__dirname, `app.db`), join(__dirname, '/assets/app.db')) // copy database file
            // initDatabase(); /**INITIALIZE DATABASE */
            console.log(`✔️  Database Initialized...`)
            execSync(`cd client_ui && npm run build`, (error) => { if (error) console.log(error) });
            copyFolder(join(__dirname, 'client_ui/dist'), join(__dirname, 'assets/ui'))
            copyFileSync(join(__dirname, `logo.ico`), join(__dirname, 'assets/favicon.ico')) //copy app icon
            rmSync(join(__dirname, 'client_ui/dist'), { force: true, recursive: true }) //delete dist folder
            console.log(`✔️  Build Client UI...`)

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
