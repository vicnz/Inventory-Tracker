const { ipcRenderer } = require('electron')

module.exports = function () {
    return {
        products: async () => {
            let result = await ipcRenderer.invoke('all', {
                sql: 'SELECT id, product, (max - quantity) as remainder, quantity FROM master ORDER BY product ASC',
                params: []
            })
            if (result.error) {
                return [];
            } else {
                return result;
            }
        },
        categories: async () => {
            let result = await ipcRenderer.invoke('all', {
                sql: 'SELECT * FROM categories',
                params: []
            })
            if (result.error) {
                return [];
            } else {
                return result;
            }
        },
        warehouses: async () => {
            let result = await ipcRenderer.invoke('all', {
                sql: 'SELECT * FROM warehouses',
                params: []
            })
            if (result.error) {
                return []
            } else {
                return result;
            }
        },
        suppliers: async () => {
            let result = await ipcRenderer.invoke('all', {
                sql: 'SELECT id, name, company, type FROM clients ORDER BY name ASC',
                params: []
            })

            if (result.error) {
                return [];
            } else {
                let data = { data: result?.data?.filter(key => key.type === 'supplier') }
                return data;
            }
        },
        customers: async () => {
            let result = await ipcRenderer.invoke('all', {
                sql: 'SELECT id, name, company, type FROM clients ORDER BY name ASC',
                params: []
            })

            if (result.error) {
                return [];
            } else {
                let data = { data: result?.data?.filter(key => key.type === 'customer') }
                return data;
            }
        }
    }
}