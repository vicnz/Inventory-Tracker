const { ipcRenderer } = require('electron')

module.exports = function () {
    return {
        exists: async (id) => {
            let result = await ipcRenderer.invoke('get', {
                sql: 'SELECT * FROM warehouses WHERE id = ?',
                params: id
            })
            return result ? true : false;
        },
        getAll: async () => {
            let result = await ipcRenderer.invoke('all', {
                sql: 'SELECT * FROM warehouse_items',
                params: []
            })
            if (result.error) {
                return []
            } else {
                return result;
            }
        },
        getOne: async (id) => {
            let result = ipcRenderer.invoke('get', {
                sql: 'SELECT * FROM warehouses WHERE id = ?',
                params: id
            })
            if (result.error) return [];
            else return result;
        },


        insert: async (data) => {
            let result = ipcRenderer.invoke('insert', {
                sql: `INSERT INTO warehouses VALUES(@id, @label, @location, DATETIME('now'))`, //TODO
                params: [...data]
            })
            if (result.error) return { error: result.error }
            return result;
        },
        update: async (data) => {
            let result = ipcRenderer.invoke('update', {
                sql: `UPDATE warehouses SET label=@label, location=@location WHERE id=@id`,
                params: [...data]
            })

            if (result.error) {
                return { error: result.error }
            }
            return result;
        },
        delete: async (ids) => {
            let result = ipcRenderer.invoke('delete', {
                sql: `DELETE FROM warehouses WHERE id = ?`,
                params: [...ids]
            })
            if (result.error) {
                return { error: result.error }
            }
            return result;
        }
    }
}