const { ipcRenderer } = require('electron')

module.exports = function () {
    return {
        exists: async (id) => {
            let result = await ipcRenderer.invoke('get', {
                sql: 'SELECT * FROM outgoing WHERE id = ?',
                params: id
            })
            return result ? true : false;
        },
        getAll: async () => {
            let result = await ipcRenderer.invoke('all', {
                sql: 'SELECT * FROM outgoing_view',
                params: []
            })
            if (result.error) {
                return []
            } else {
                return result;
            }
        },
        getOne: async (id) => {
            let result = await ipcRenderer.invoke('get', {
                sql: 'SELECT * FROM outgoing WHERE id = ?',
                params: id
            })
            if (result.error) return [];
            else return result;
        },

        insert: async (data) => {
            let result = await ipcRenderer.invoke('insert', {
                sql: `
                INSERT INTO outgoing (id, product, quantity, shipment, arrived, client, timestamp)
                VALUES (@id, @product, @quantity, @shipment, @arrived, @client, DATETIME('now'))
                `,
                params: [...data]
            })

            return result;
        },
        update: async (data) => {
            const result = await ipcRenderer.invoke('update', {
                sql: `
                UPDATE outgoing
                SET
                    product=@product,
                    quantity=@quantity,
                    shipment=@shipment,
                    arrived=@arrived
                WHERE id=@id
                `,
                params: [...data]
            })

            return result;
        },
        delete: async (ids) => {
            const result = await ipcRenderer.invoke('delete', {
                sql: `DELETE FROM outgoing WHERE id = ?`,
                params: [...ids]
            })

            return result;
        },
        audited: async () => {
            const result = await ipcRenderer.invoke('all', {
                sql: `SELECT * FROM outgoing_arrived_view`,
                params: []
            })
            if (result?.error) {
                return []
            } else {
                return result;
            }
        },
        deleteAudited: async (ids) => {
            const result = await ipcRenderer.invoke('delete', {
                sql: `DELETE FROM outgoing WHERE arrived = 1 AND id = ?`,
                params: ids
            })

            return result;
        }
    }
}