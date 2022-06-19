/**
 * IMPORTS
 */
const { ipcRenderer } = require('electron')
module.exports = function () {
    return {
        /**
         * 
         * @param {String} id 
         * @returns Object
         */
        exists: async (id) => {
            let result = await ipcRenderer.invoke('get', {
                sql: 'SELECT * FROM ingoing WHERE id = ?',
                params: [id]
            })
            return result ? true : false;
        },
        /**
         * @returns Array<*>
         */
        getAll: async () => {
            let result = await ipcRenderer.invoke('all', {
                sql: 'SELECT * FROM ingoing_view',
                params: []
            })
            if (result?.error) {
                return []
            } else {
                return result;
            }
        },
                /**
         * GET ONE IMPORT
         * @param {String} id 
         */
        getOne: async (id) => {
            let result = await ipcRenderer.invoke('get', {
                sql: 'SELECT * FROM ingoing WHERE id = ?',
                params: id
            })
            if (result?.error) {
                return []
            } else {
                return result;
            }
        },
        /**
         * INSERT NEW IMPORTS
         * @param {Array<Object>} data 
         */
        insert: async (data) => {
            let result = await ipcRenderer.invoke('insert', {
                sql: `
                INSERT INTO ingoing
                (id, product, quantity, shipment, arrival, arrived, supplier, timestamp)
                VALUES
                (@id, @product, @quantity, @shipment, @arrival, @arrived, @supplier, DATETIME('now'))
                 `,
                params: [...data]
            })
            return result;
        },
        /**
         * UPDATE
         * @param {Array<Object>} data 
         */
        update: async (data) => {
            let result = await ipcRenderer.invoke('update', {
                sql: `
                UPDATE ingoing
                    SET
                    product=@product,
                    quantity=@quantity,
                    shipment=@shipment,
                    arrival=@arrival,
                    arrived=@arrived,
                    supplier=@supplier
                WHERE id=@id;
                `,
                params: [...data]
            })

            return result;
        },
        /**
         * Delete
         * @param {Array<String>} ids  
         */
        delete: async (ids) => {
            let result = await ipcRenderer.invoke('delete', {
                sql: `DELETE FROM ingoing WHERE id=?`,
                params: [...ids]
            })
            return result
        }
    }
}

