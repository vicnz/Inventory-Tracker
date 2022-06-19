const { ipcRenderer } = require('electron')
module.exports = function () {
    return {
        inventory: async () => {
            const result = await ipcRenderer.invoke('all', {
                sql: `SELECT * FROM inventory_summary`,
                params: []
            })
            return result
        },
        imports: async () => {
            const result = await ipcRenderer.invoke('all', {
                sql: `SELECT * FROM ingoing_summary`,
                params: []
            })
            return result;
        },
        exports: async () => {
            const result = await ipcRenderer.invoke('all', {
                sql: `SELECT * FROM outgoing_summary`,
                params: []
            })
            return result;
        },
        category: async () => {
            const result = await ipcRenderer.invoke('all', {
                sql: `SELECT label, products FROM category_items`,
                params: []
            })
            return result;
        },
        warehouse: async () => {
            const result = await ipcRenderer.invoke('all', {
                sql: `SELECT label, products FROM warehouse_items`,
                params: []
            })
            return result;
        },
        clients: async () => {
            //TODO
            const result = await ipcRenderer.invoke('all', {
                sql: `SELECT * FROM inventory`,
                params: []
            })

            console.log(result);
            return null;
        }

    }
}