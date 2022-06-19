const { ipcRenderer } = require('electron')

module.exports = function () {
    return {
        exists: async ({ type, id }) => {
            let result = await ipcRenderer.invoke('get', {
                sql: `SELECT id, name FROM clients WHERE id=? AND type=?`,
                params: [id, type]
            })
            return result ? true : false;
        },
        getAll: async ({ type }) => {
            if (type === 'supplier') {
                let result = await ipcRenderer.invoke('all', {
                    sql: 'SELECT * FROM clients_supplier',
                    params: []
                })
                if (result?.error) {
                    return [];
                } else {
                    return result;
                }
            } else if (type === 'customer') {
                let result = await ipcRenderer.invoke('all', {
                    sql: 'SELECT * FROM clients_customer',
                    params: []
                })
                if (result?.error) {
                    return [];
                } else {
                    return result;
                }
            }
        },
        getOne: async ({ type, id }) => {
            let result = await ipcRenderer.invoke('get', {
                sql: `SELECT * FROM clients WHERE id=? AND type=?`,
                params: [id, type]
            })
            if (result?.error) {
                return []
            } else {
                return result;
            }
        },
        insert: async ({ data }) => {
            let result = await ipcRenderer.invoke('insert', {
                sql: `
                    INSERT INTO clients
                        (id, name, company, address, contact, email, type, timestamp)
                    VALUES
                        (@id, @name, @company, @address, @contact, @email, @type, DATETIME('now'))
                    `,
                params: [data]
            })
            if (result?.error) {
                return true
            }
        },
        update: async ({ data }) => {
            let result = await ipcRenderer.invoke('update', {
                sql: `UPDATE clients SET name=@name, company=@company, address=@address, contact=@contact, email=@email WHERE id = @id;`,
                params: [data]
            })
            if (result?.error) {
                return true
            }
        },
        delete: async ({ data }) => {
            let result = await ipcRenderer.invoke('delete', {
                sql: `DELETE FROM clients WHERE id=?`,
                params: [...data]
            })
            return result?.error || undefined
        }
    }
}