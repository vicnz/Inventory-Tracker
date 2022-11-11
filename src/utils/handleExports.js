//@ts-check
// @ts-ignore
const { unparse } = require('./papaparse.min.js')
const { dialog, ipcRenderer, shell } = require('electron')
const { writeFile } = require('fs/promises')
const { join } = require('path')
/**Main Process Handle Exports */

async function promptSaveFile(app, mainWindow, type, data) {
    try {
        let defaultExportPath = join(app.getPath('downloads'), "exports.csv")
        let filter = { name: 'CSV (Comma Seperated Values)', extensions: ['csv'] }
        let { columns, rows, timestamp, title } = data;
        let exportString = "";

        switch (type) {
            case 'html':
                defaultExportPath = join(app.getPath('downloads'), "exports.html")
                exportString = await parseToHTML(rows, columns, "Exported HTML Rows") || ""
                filter = { name: 'HTML (HyperText Markup Language)', extensions: ['html', 'htm'] }
                break;
            case 'markdown':
                defaultExportPath = join(app.getPath('downloads'), "exports.md")
                exportString = await parseToMarkdown(rows, columns, "Exported Markdown Rows") || ""
                filter = { name: 'Markdown', extensions: ['md', 'mdx'] }
                break;
            default:
                defaultExportPath = join(app.getPath('downloads'), "exports.csv")
                exportString = await parsetoCSV(rows) || ""
                filter = { name: 'CSV (Comma Separated Values)', extensions: ['csv'] }
                break;
        }

        const prompt = await dialog.showSaveDialog(mainWindow, {
            title: 'Export Selected Rows',
            defaultPath: defaultExportPath,
            filters: [filter]
        })

        if (prompt.canceled) {
            return;
        } else {
            // @ts-ignore
            writeFile(prompt.filePath, exportString?.data).then(async () => {
                const result = await dialog.showMessageBox(mainWindow, { title: "Exported", type: 'info', message: `📁 Exported as ${type} at ${prompt?.filePath}`, buttons: ['Open', 'Close'] })
                if (result.response === 0) {
                    //@ts-ignore
                    shell.showItemInFolder(prompt?.filePath)
                }
                return;
            }).catch(error => {
                // @ts-ignore
                throw new Error({ error: error, message: `Exporting "${prompt.filePath}" Failed...` })
            })
        }
    } catch (err) {
        // @ts-ignore
        const { message, error } = err;
        dialog.showErrorBox('Failed', `Exporting ${message} Failed...`)
        ipcRenderer.send('log-debug', `[main]:[handleExport.js] Exports Failed ${message}`)
    }
}



/**
 * @name parseToMarkdown
 * @description Parse Tabular Data to Markdown Format
 * @param {JSON | Array<Array<any>>} data 
 * @param {Array<String>} headers 
 * @param {String} title 
 * @param {String} timestamp 
 * @returns String
 */
function parseToMarkdown(data, headers, title = 'Exported Rows', timestamp = new Date(Date.now()).toLocaleString()) {
    return new Promise((resolved, reject) => {
        /**Build Markdown Header */
        function buildHeader(headers) {
            const converted = headers.join(' | ');
            // @ts-ignore
            const headerBox = headers.map(key => ` ---- `).join(' | ')
            return `| ${converted} |\r\n| ${headerBox} |\r\n`
        }
        /**Parse Data */
        try {
            /**Get Headers */
            const header = buildHeader(headers)
            /**Parse to Markdown */
            const parsedData = unparse(data, {
                header: false,
                delimiter: ' | ',
                newline: ' |\r\n| '
            });
            /**Build Caption */
            const caption = `# ${title}\r\n\r\n\`generated at: ${timestamp}\`\r\n\r\n----\r\n\r\n`
            /**Assemble Markdown Text */
            const markdownText = `${caption} ${header} | ${parsedData} |\r\n`
            return resolved({ data: markdownText });
        } catch (err) {
            return reject({ error: 'Parse Error', exception: err });
        }
    });
}

/**
 * @name parseToHTML
 * @description Parse Tabular Data to HTML format
 * @param {JSON | Array<Array<any>>} data 
 * @param {Array<String>} headers 
 * @param {String} title 
 * @param {String} timestamp 
 * @returns String
 */
function parseToHTML(data, headers, title = "Exported Rows", timestamp = new Date(Date.now()).toLocaleString()) {
    return new Promise((resolved, reject) => {
        /**Buid HTML Styles */
        function buildStyles() {
            return `
            <style>
                :root,
                body {
                    height: 100%;
                    width: 100%;
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    background-color: rgb(255, 251, 235);
                    display: grid;
                    place-items: center;
                }
                table{
                    border-collapse: collapse;
                }
                table thead {
                    background: burlywood;
                    color: rgb(255, 255, 255);
                    text-transform: capitalize;
                    font-weight: 500;
                }

                table tr td{
                    border: solid brown 2px;
                    padding: 5px;
                }
                table tr:hover {
                    background-color: burlywood;
                    cursor: pointer;
                }
                caption {
                    width: 100%;
                    color: brown;
                    padding-top: 10px;
                    padding-bottom: 10px;
                }
                caption h3{
                    text-transform: uppercase;
                    font-weight: 700;
                }
                caption em{
                    font-size: 14;
                }
            </style>
        `
        }
        /**Build Table Header */
        function buildThead(items) {
            const head = items.map(item => `<td>${item.toString()}</td>`).join('\r\n')
            return `
                <thead>
                    <tr>${head.replace(/_/g, ' ')}</tr>
                </thead>
            `;
        }

        /** Build Table Caption */
        function buildCaption(title, timestamp) {
            return `
                <caption>
                    <h3>${title}</h3>
                    <em>${timestamp}</em>
                </caption>
            `
        }
        /**Build Table Body */
        function buildTbody(data) {
            const parsedData = unparse(data, {
                header: false,
                delimiter: `</td><td>`,
                newline: `</td></tr><tr><td>`
            });
            return `<tr><td>${parsedData}</td></tr>`
        }

        try {
            const styles = buildStyles()
            const thead = buildThead(headers)
            const tbody = buildTbody(data)
            const caption = buildCaption(title, timestamp)

            const html = `
                <html>
                    <head>
                        <title>${title} : ${timestamp}</title>
                        ${styles}
                    </head>
                    <body>
                        <table>
                            ${caption}
                            ${thead}
                            ${tbody}
                        </table>
                    </body>
                </html>
            `
            return resolved({ data: html });
        } catch (err) {
            return reject({ error: 'Parser Error', exception: err })
        }

    });
}

/**
 * @name parsetoCSV
 * @description Parsed Tabular data to CSV format
 * @param {JSON | Array<Array<any>>} data 
 * @param {{delimiter?: String, newline?: String, header?: Boolean, quotes?: false | Array<Boolean>, quoteChar?: String, skipEmptyLines?: false | 'greedy', columns?: null | Array<String>}} options 
 * @returns String
 */
function parsetoCSV(data, options = {}) {
    return new Promise((resolved, reject) => {
        try {
            const parsed = unparse(data, { ...options })
            return resolved({ data: parsed });
        } catch (err) {
            return reject({ error: 'Parsing Error', exception: err })
        }
    });
}

module.exports = {
    promptSaveFile,
    parseToHTML,
    parseToMarkdown,
    parsetoCSV
}