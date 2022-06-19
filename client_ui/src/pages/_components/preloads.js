/**
 * PRELOAD DATA (DASHBOARD)
 * @returns {{}}
 */
export const dashboardData = async function () {
    const inventory = await window?.dashboard?.inventory();
    const imports = await window?.dashboard?.imports();
    const exports = await window?.dashboard?.exports();

    let totalItems = [
        inventory?.data[0]?.total_items || 0,
        imports?.data[0]?.total_items || 0,
        exports?.data[0]?.total_items || 0,
    ];

    let totalItemsProducts = [
        inventory?.data[0]?.max_quantity_product || 0,
        imports?.data[0]?.max_quantity_item || 0,
        exports?.data[0]?.max_quantity_item || 0,
    ];
    let totalPrice = [
        inventory?.data[0]?.total_price || 0,
        imports?.data[0]?.total_price || 0,
        exports?.data[0]?.total_price || 0,
    ];
    let totalQuantity = [
        inventory?.data[0]?.total_inventory_quantity || 0,
        imports?.data[0]?.total_quantity || 0,
        exports?.data[0]?.total_quantity || 0,
    ];
    let maxQuantity = [
        inventory?.data[0]?.max_quantity || 0,
        imports?.data[0]?.max_quantity || 0,
        exports?.data[0]?.max_quantity || 0,
    ];

    return {
        itemTotals: totalItemsProducts,
        totals: totalItems,
        price: totalPrice,
        quantity: totalQuantity,
        maxQty: maxQuantity,
        audits: {
            unaudited: [imports?.data[0]?.unaudited, exports?.data[0]?.unaudited] || [0, 0],
            audited: [imports?.data[0]?.audited, exports?.data[0]?.audited] || [0, 0]
        }
    };
}

/**
 * PRELOAD DATA (INVENTORY)
 * @returns {{columns: Array<Object>, rows: Array<Array<any>>}}
 */
export const inventoryData = async () => {
    /**
     * ? DEFINED COLUMNS
     */
    const columns = [
        { label: "Id", type: "string", name: "id" },
        { label: "Product", type: "string", name: "product" },
        { label: "Description", type: "string", name: "description" },
        { label: "Category", type: "string", name: "category" },
        { label: "Quantity (Max)", type: "number", name: "max_quantity" },
        { label: "Quantity", type: "number", name: "quantity" },
        { label: "Unit Price", type: "currency", name: "unit_price" },
        { label: "Total Price", type: "currency", name: "total_price" },
        { label: "Warehouse No.", type: "string", name: "warehouse_number" },
        {
            label: "Warehouse Location",
            type: "string",
            name: "warehouse_location",
        },
    ];
    const columnRef = columns.map((item) => item.name);
    const result = await window?.inventory?.getAll();
    const rows = result?.data?.map((row) => {
        return columnRef.map((key) => {
            return row[key];
        });
    });

    return {
        columns,
        rows,
    };
}

/**
 * * PRELOAD DATA
 * @returns {{columns: Array<Object>, rows: Array<Array<*>>>}}
 */
export const importsData = async () => {
    /**DEFINE COLUMNS*/
    const columns = [
        { label: "Id", type: "string", name: "id" },
        { label: "Product", type: "string", name: "product" },
        { label: "Description", type: "string", name: "description" },
        { label: "Order Quantity", type: "number", name: "quantity" },
        { label: "Unit Price", type: "currency", name: "price" },
        { label: "Total Price", type: "currency", name: "total" },
        { label: "Shipment", type: "date", name: "shipment" },
        { label: "Arrival", type: "date", name: "arrival" },
        { label: "Arrived?", type: "boolean", name: "arrived" },
        { label: "Supplier", type: "string", name: "supplier_name" },
        { label: "Company", type: "string", name: "supplier_company" },
        { label: "Contact", type: "string", name: "supplier_contact" },
        { label: "Email", type: "string", name: "supplier_email" },
    ];
    const columnRef = columns.map((item) => item.name);
    const result = await window?.imports?.getAll();
    const rows = result?.data?.map((row) => {
        return columnRef.map((key) => {
            return row[key];
        });
    });

    return {
        columns,
        rows,
    };
}

/**
   * * PRELOAD DATA
   * @returns {{columns: <Array<Object>, rows: <Array<Array<*>>>}}
   */
export const exportsData = async () => {
    /**DEFINE COLUMNS*/
    const columns = [
        { label: "Id", type: "string", name: "id" },
        { label: "Product", type: "string", name: "product" },
        { label: "Description", type: "string", name: "description" },
        { label: "Unit Price", type: "currency", name: "price" },
        { label: "Export Quantity", type: "number", name: "quantity" },
        { label: "Total Price", type: "currency", name: "total" },
        { label: "Shipment", type: "date", name: "shipment" },
        { label: "Arrived?", type: "boolean", name: "arrived" },
        { label: "Name", type: "string", name: "customer_name" },
        { label: "Company", type: "string", name: "customer_company" },
        { label: "Contact", type: "string", name: "customer_contact" },
        { label: "Email", type: "string", name: "customer_email" },
    ];
    const columnRef = columns.map((item) => item.name);
    const result = await window?.exports?.getAll();
    const rows = result?.data?.map((row) => {
        return columnRef.map((key) => {
            return row[key];
        });
    });

    return {
        columns,
        rows,
    };
}