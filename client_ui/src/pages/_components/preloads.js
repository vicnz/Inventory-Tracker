/**
 * PRELOAD DATA (DASHBOARD)
 * @returns {{}}
 */
export const dashboardData = async function () {
    const inventory = await window?.dashboard?.inventory();
    const imports = await window?.dashboard?.imports();
    const exports = await window?.dashboard?.exports();

    const inv = inventory?.data[0]
    const imp = imports?.data[0]
    const exp = exports?.data[0]

    const totalItemCount = [
        { name: 'inventory', value: inv?.total_items || 0 },
        { name: 'imports', value: imp?.total_items || 0 },
        { name: 'exports', value: exp?.total_items || 0 },
    ]
    const qtyTotal = [
        { name: 'inventory', value: inv?.total_inventory_quantity || 0 },
        { name: 'imports', value: imp?.total_quantity || 0 },
        { name: 'exports', value: exp?.total_quantity || 0 },
    ]
    const qtyMaxProduct = [
        { name: 'inventory', value: inv?.max_quantity || 0, product: inv?.max_quantity_product || 'N/A' },
        { name: 'imports', value: imp?.max_quantity || 0, product: imp?.max_quantity_item || 'N/A' },
        { name: 'exports', value: exp?.max_quantity || 0, product: exp?.max_quantity_item || 'N/A' },
    ]
    const priceTotal = [
        { name: 'inventory', value: inv?.total_price || 0 },
        { name: 'imports', value: imp?.total_price || 0 },
        { name: 'exports', value: exp?.total_price || 0 },
    ]
    const priceMaxProduct = [
        { name: 'inventory', value: inv?.max_price || 0, product: inv?.max_priced_item || 'N/A' },
        { name: 'imports', value: imp?.max_price || 0, product: imp?.max_price_item || 'N/A' },
        { name: 'exports', value: exp?.max_price || 0, product: exp?.max_price_item || 'N/A' }
    ]
    const auditedProducts = {
        audited: {
            imports: imp?.audited || 0,
            exports: exp?.audited || 0
        },
        unaudited: {
            imports: imp?.unaudited || 0,
            exports: exp?.unaudited || 0
        }
    }

    return {
        count: totalItemCount,
        quantity: qtyTotal,
        quantityItem: qtyMaxProduct,
        price: priceTotal,
        priceItem: priceMaxProduct,
        audit: auditedProducts
    }
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

/**
 * * DISCARDED ITEMS
 * @returns {{rows: Array<string>, columns: Array<Array<any>>}}
 */
export const preloadDiscardedInventory = async () => {
    const columns = [
        { label: "ID", type: "string", name: "discard_id" },
        { label: "Product", type: "string", name: "product" },
        { label: "Description", type: "string", name: "description" },
        { label: "Category", type: "string", name: "category" },
        { label: "Quantity", type: "number", name: "quantity" },
        { label: "Max (Quantity)", type: "number", name: "max" },
        { label: "Warehouse", type: "string", name: "warehouse" },
        { label: "Address", type: "string", name: "address" },
        { label: "ODT", type: "string", name: "timestamp" }
    ]

    const columnRef = columns.map((item) => item.name);
    const result = await window?.inventory?.discarded();
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

export const importsDataAudited = async () => {
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
        { label: "Supplier", type: "string", name: "supplier_name" },
        { label: "Company", type: "string", name: "supplier_company" },
        { label: "Contact", type: "string", name: "supplier_contact" },
        { label: "Email", type: "string", name: "supplier_email" },
    ];
    const columnRef = columns.map((item) => item.name);
    const result = await window?.imports?.importsAudited();
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

export const exportsDataAudited = async () => {
    /**DEFINE COLUMNS*/
    const columns = [
        { label: "Id", type: "string", name: "id" },
        { label: "Product", type: "string", name: "product" },
        { label: "Description", type: "string", name: "description" },
        { label: "Order Quantity", type: "number", name: "quantity" },
        { label: "Unit Price", type: "currency", name: "price" },
        { label: "Total Price", type: "currency", name: "total" },
        { label: "Shipment", type: "date", name: "shipment" },
        { label: "Client", type: "string", name: "customer_name" },
        { label: "Company", type: "string", name: "customer_company" },
        { label: "Contact", type: "string", name: "customer_contact" },
        { label: "Email", type: "string", name: "customer_email" },
    ];
    const columnRef = columns.map((item) => item.name);
    const result = await window?.exports?.audited();
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