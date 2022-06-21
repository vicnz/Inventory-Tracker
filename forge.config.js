// const {utils: {fromBuildIdentifier}} = require('@electron-forge/core')
const { mkdirSync, copyFileSync, existsSync, lstatSync, readdirSync } = require('fs')
const { join } = require('path')
const ignoreLists = [
    "/.gitignore",
    "/client_ui",
    "/data-sets",
    "/app.dev.db",
    "/logo.ico",
    "/logo.png",
    "/schema.dev.sql",
    "/schemadata.dev.sql",
    "/TODO.txt",
    "/README.md"
]


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
            console.log('\n🕑 generating assets\n')
            if (!existsSync(join(__dirname, '/assets/'))) {
                mkdirSync(join(__dirname, '/assets/'))
            }
            copyFileSync(join(__dirname, `app.dev.db`), join(__dirname, 'assets/app.db')) // copy database file
            copyFileSync(join(__dirname, `logo.ico`), join(__dirname, 'assets/favicon.ico')) //copy app icon
            copyFolder(join(__dirname, 'client_ui/dist'), join(__dirname, 'assets/ui'))
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


