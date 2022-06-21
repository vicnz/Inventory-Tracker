/**
 * @ INVENTORY DATABASE RENDERER EXPOSED API
 */
const { ipcRenderer } = require('electron')

module.exports = function () {
    return {
        /**
         * * CHECK IF ITEM EXISTS
         * @param {String} id 
         * @returns {*}
         */
        exists: async (id) => {
            let result = await ipcRenderer.invoke('get', {
                sql: 'SELECT * FROM master WHERE id = ?',
                params: [id]
            })
            return result ? true : false;
        },

        /**
         * * GET ALL ITEMS
         * @returns {Array<Object> | *}
         */
        getAll: async () => {
            let result = await ipcRenderer.invoke('all', {
                sql: 'SELECT * FROM inventory',
                params: []
            })
            if (result.error) {
                return []
            } else {
                return result;
            }
        },
        /**
         * * GET ONE ITEM
         * @param {String} id 
         * @returns {Object}
         */
        getOne: async (id) => {
            let result = await ipcRenderer.invoke('get', {
                sql: 'SELECT * FROM master WHERE id = ?',
                params: id
            })

            if (result.error) {
                return {}
            } else {
                return result;
            }
        },
        /**
         * * INSERT MANY
         * @param {Array<Object>} data 
         * @returns {undefined | *}
         */
        insert: async (data) => {
            let result = await ipcRenderer.invoke('insert', {
                sql: `
                INSERT INTO master
                (id, product, description, category, quantity, max, unit_price, warehouse, timestamp)
                VALUES (@id, @product, @description, @category, @quantity, @max, @unit_price, @warehouse, DATETIME('now'))`,
                params: [...data]
            })

            return result;
        },
        /**
         * * UPDATE MANY
         * @param {Array<Object>} data 
         * @returns {undefined | *}
         */
        update: async (data) => {
            let result = await ipcRenderer.invoke('update', {
                sql: `
                    UPDATE master SET
                        product=@product,
                        description=@description,
                        category=@category,
                        max=@max,
                        quantity=@quantity,
                        unit_price=@unit_price,
                        warehouse=@warehouse
                    WHERE id = @id
                `,
                params: [...data]
            })
            return result;
        },
        /**
         * * DELETE MANY
         * @param {Array<String>} ids 
         * @returns 
         */
        delete: async (ids) => {
            let result = await ipcRenderer.invoke('delete', {
                sql: `DELETE FROM master WHERE id = ?`,
                params: [...ids]
            })
            return result
        },
        /**
         * * GET DISCARDED ITEMS
         * @returns {Array<any>}
         */
        discarded: async () => {
            let result = await ipcRenderer.invoke('all', {
                sql: `SELECT * FROM master_discarded ORDER BY timestamp DESC`,
                params: []
            })
            if (result.error) {
                return []
            } else {
                return result;
            }
        },
        discardedOne: async (id) => {
            let result = await ipcRenderer.invoke('get', {
                sql: `SELECT * FROM master_discarded WHERE discard_id = ?`,
                params: id
            })
            return result;
        },
        discardedDelete: async (ids) => {
            let result = await ipcRenderer.invoke('delete', {
                sql: `DELETE FROM master_discarded WHERE discard_id = ?`,
                params: ids
            })
            return result;
        }
    }
}