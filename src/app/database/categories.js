const { ipcRenderer } = require('electron')

module.exports = function () {
    return {
        /**CHECK IF ITEM ID ALREADY EXISTS */
        exists: async (id) => {
            let result = await ipcRenderer.invoke('get', {
                sql: 'SELECT * FROM categories WHERE id = ?',
                params: id
            })
            return result ? true : false;
        },
        /**GET ALL CATEGORY ITEMS */
        getAll: async () => {
            let result = await ipcRenderer.invoke('all', {
                sql: 'SELECT * FROM category_items',
                params: []
            })
            if (result.error) {
                return []
            } else {
                return result;
            }
        },
        //GET ONE CATEGORY ITEM
        getOne: async (id) => {
            let result = ipcRenderer.invoke('get', {
                sql: 'SELECT * FROM categories WHERE id = ?',
                params: id
            })
            if (result.error) return [];
            else return result;
        },
        //INSERT ALL/ONE CATEGORY ITEM
        insert: async (data) => {
            let result = ipcRenderer.invoke('insert', {
                sql: `INSERT INTO categories VALUES (@id, @label, DATETIME('now'))`,
                params: [...data]
            })
            if (result.error) {
                return { error: result.error }
            }
            return result;
        },
        //UPDATE ALL/ONE CATEGORY ITEM
        update: async (data) => {
            let result = ipcRenderer.invoke('update', {
                sql: `UPDATE categories SET label=@label WHERE id=@id;`,
                params: [...data]
            })

            if (result.error) {
                return { error: result.error }
            }
            return result;
        },
        //DELETE ALL/ONE CATEGORY ITEM
        delete: async (ids) => {
            let result = ipcRenderer.invoke('delete', {
                sql: `DELETE FROM categories WHERE id = ?`,
                params: [...ids]
            })
            if (result.error) {
                return { error: result.error }
            }
            return result;
        }
    }
}