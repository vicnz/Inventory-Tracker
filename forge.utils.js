/**
 * IGNORED FILES DURING PACKAGING
 */
module.exports.ignoreLists = [
    "/.gitignore",
    "/client_ui",
    "/data-sets",
    "/app.dev.db",
    "/logo.ico",
    "/logo.png",
    "/schema.dev.sql",
    "/schemadata.dev.sql",
    "/TODO.txt",
    "/README.md",
    "/dev-test"
]
/**
 * 
 * @param {any} database 
 * @param {Array<string>} sqlArray 
 * @returns any
 */
module.exports.create = (database, sqlArray) => {
    const statements = sqlArray.map(sql => {
        return database.prepare(sql)
    })
    return database.transaction(() => {
        let result;
        for (const stmt of statements) {
            // if(stmt.reader) result = stmt.get(param)
            // else stmt.run(param)
            result = stmt.run()
        }
        return result;
    })
}


module.exports.createStatements = [
    `CREATE TABLE "categories" (
        "id"	TEXT,
        "label"	TEXT NOT NULL,
        "timestamp" TEXT,
        PRIMARY KEY("id")
    )`,
    `CREATE TABLE "warehouses" (
        "id"	TEXT,
        "label"	TEXT NOT NULL,
        "location"	TEXT DEFAULT "N/A",
        "timestamp" TEXT,
        PRIMARY KEY("id")
    )`,
    `CREATE TABLE "clients" (
        "id"	TEXT,
        "name"	TEXT NOT NULL,
        "company"	TEXT NOT NULL DEFAULT 'N/A',
        "address"	TEXT DEFAULT "N/A",
        "contact"	TEXT DEFAULT "N/A",
        "email"	TEXT DEFAULT "N/A",
        "type"	TEXT NOT NULL DEFAULT "customer", --? types is ["supplier", "customer"]
        "timestamp" TEXT,
        PRIMARY KEY("id")
    )`,
    `CREATE TABLE "master" (
        "id"	TEXT,
        "product"	TEXT NOT NULL,
        "description"	TEXT,
        "category"	TEXT NOT NULL,
        "quantity"	INTEGER NOT NULL DEFAULT 0 CHECK(quantity > -1 AND quantity <= max),
        "max"	INTEGER NOT NULL DEFAULT 0 CHECK(max > -1),
        "unit_price" NUMERIC NOT NULL DEFAULT 0 CHECK(unit_price > -1),
        "warehouse"	TEXT NOT NULL,
        "timestamp" TEXT,
        PRIMARY KEY("id"),
        FOREIGN KEY("warehouse") REFERENCES "warehouses"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
        FOREIGN KEY("category") REFERENCES "categories"("id") ON UPDATE CASCADE ON DELETE RESTRICT
    )`,
    `CREATE TABLE "master_discarded" (
        "discard_id" TEXT,
        "product" TEXT NOT NULL,
        "description" TEXT,
        "category" TEXT,
        "quantity" INTEGER,
        "max" INTEGER,
        "unit_price" NUMERIC,
        "warehouse" TEXT,
        "address" TEXT,
        "timestamp" TEXT,
        PRIMARY KEY("discard_id")
    )`,
    `CREATE TABLE "ingoing" (
        "id"	TEXT,
        "product"	TEXT NOT NULL,
        "quantity"	INTEGER NOT NULL DEFAULT 0 CHECK(quantity > -1),
        "shipment"	TEXT NOT NULL,
        "arrival"	TEXT,
        "arrived"	INTEGER NOT NULL DEFAULT 0,
        "supplier"	TEXT NOT NULl,
        "timestamp" TEXT,
        FOREIGN KEY("supplier") REFERENCES "clients"("id") ON UPDATE CASCADE ON DELETE SET NULL,
        FOREIGN KEY("product") REFERENCES "master"("id") ON UPDATE CASCADE ON DELETE CASCADE,
        PRIMARY KEY("id")
    )`,
    `CREATE TABLE "ingoing_discarded"(
        discard_id TEXT,
        product TEXT,
        quantity INTEGER,
        shipment TEXT,
        arrival TEXT,
        arrived INTEGER,
        supplier_name TEXT,
        supplier_company TEXT,
        supplier_address TEXT,
        supplier_contact TEXT,
        supplier_email TEXT,
        timestamp TEXT,
        PRIMARY KEY("discard_id")
    )`,
    `CREATE TABLE "outgoing" (
        "id"	TEXT,
        "product"	TEXT NOT NULL,
        "quantity"	INTEGER NOT NULL DEFAULT 0 CHECK (quantity > -1),
        "shipment"	TEXT NOT NULL,
        "arrived"	INTEGER NOT NULL DEFAULT 0,
        "client"	TEXT NOT NULL,
        "timestamp" TEXT,
        PRIMARY KEY("id"),
        FOREIGN KEY("product") REFERENCES "master"("id") ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY("client") REFERENCES "clients"("id") ON UPDATE CASCADE ON DELETE SET NULL
    )`,
    `CREATE TABLE "outgoing_discarded"(
        "discard_id" TEXT,
        "product" TEXT,
        "quantity" INTEGER,
        "shipment" TEXT,
        "arrived" INTEGER,
        "client_name" TEXT,
        "client_company" TEXT,
        "client_address" TEXT,
        "client_contact" TEXT,
        "client_email" TEXT,
        "timestamp" TEXT,
        PRIMARY KEY ("discard_id")
    )`,
    `CREATE VIEW inventory AS 
    SELECT
        master.id as 'id',
        categories.label as 'category',
        master.product as product,
        master.description as description,
        master.quantity as quantity, 
        master.max as max_quantity,
        master.unit_price as unit_price,
        (master.quantity * master.unit_price) as total_price,
        warehouses.label as warehouse_number,
        warehouses.location as warehouse_location
    FROM master
    INNER JOIN categories
    ON master.category = categories.id
    INNER JOIN warehouses ON 
    master.warehouse  = warehouses.id
    ORDER BY master.timestamp DESC`,
    `CREATE VIEW ingoing_view AS
    SELECT 
        ingoing.id as id,
        master.product as product,
        master.description as description,
        master.unit_price as price,
        ingoing.quantity as quantity,
        (master.unit_price * ingoing.quantity) as 'total',
        date(ingoing.shipment) as shipment,
        date(ingoing.arrival) as arrival,
        ingoing.arrived as arrived,
        clients.name as supplier_name,
        clients.company as supplier_company,
        clients.contact as supplier_contact,
        clients.email as supplier_email
    FROM ingoing
    INNER JOIN master
    ON ingoing.product = master.id
    INNER JOIN clients
    ON ingoing.supplier = clients.id
    WHERE ingoing.arrived = 0 -- * MODIFIED
    ORDER BY ingoing.timestamp DESC`,
    `CREATE VIEW outgoing_view AS
    SELECT 
        outgoing.id as id,
        master.product as product,
        master.description as description,
        master.unit_price as price,
        outgoing.quantity as quantity,
        (master.unit_price * outgoing.quantity) as 'total',
        date(outgoing.shipment) as shipment,
        outgoing.arrived as arrived,
        clients.name as customer_name,
        clients.company as customer_company,
        clients.contact as customer_contact,
        clients.email as customer_email
    FROM outgoing
    INNER JOIN master
    ON outgoing.product = master.id
    INNER JOIN clients
    ON outgoing.client = clients.id
    WHERE outgoing.arrived = 0 --* MODIFIED
    ORDER BY outgoing.timestamp DESC`,
    `CREATE VIEW clients_supplier AS
    SELECT
      id,
      name,
      company,
      address,
      contact,
      email,
      COUNT(quantity) AS orders
    FROM
    --? SUB QUERY
      (
        SELECT
          clients.id AS id,
          clients.name AS name,
          clients.company AS company,
          clients.address AS address,
          clients.contact AS contact,
          clients.email AS email,
          clients.timestamp AS timestamp,
          clients.type as type,
          ingoing.quantity as quantity
        FROM
          clients
        LEFT JOIN ingoing ON clients.id = ingoing.supplier
      )
    WHERE type = 'supplier'
    GROUP BY id
    ORDER BY timestamp DESC`,
    `CREATE VIEW clients_customer AS
    SELECT
      id,
      name,
      company,
      address,
      contact,
      email,
      COUNT(quantity) AS orders
    FROM
    --? SUB QUERY
      (
        SELECT
          clients.id AS id,
          clients.name AS name,
          clients.company AS company,
          clients.address AS address,
          clients.contact AS contact,
          clients.email AS email,
          clients.timestamp AS timestamp,
          clients.type as type,
          outgoing.quantity as quantity
        FROM
          clients
        LEFT JOIN outgoing ON clients.id = outgoing.client
      )
    WHERE type = 'customer'
    GROUP BY id
    ORDER BY timestamp DESC`,
    `CREATE VIEW category_items
    AS
    SELECT
      id,
      label,
      COUNT(category) AS products
    FROM
    --? SUB QUERY
      (
        SELECT
          categories.id AS id,
          categories.label AS label,
          master.category AS category,
          categories.timestamp AS timestamp
        FROM
          categories
          LEFT JOIN master ON categories.id = master.category
      )
    GROUP BY id
    ORDER BY timestamp DESC`,
    `CREATE VIEW warehouse_items
    AS
    SELECT
      id,
      label,
      location,
      COUNT(building) AS products
    FROM
      (
        SELECT
          warehouses.id AS id,
          warehouses.label AS label,
          warehouses.location AS location,
          master.warehouse AS 'building',
          warehouses.timestamp as timestamp
        FROM
          warehouses
          LEFT JOIN master ON warehouses.id = master.warehouse
      )
    GROUP BY id
    ORDER BY timestamp DESC`,
    `CREATE VIEW product_list
    AS
    SELECT
        id,
        product,
        description,
        max,
        quantity,
        (max - quantity) as remaining
    FROM master`,
    `CREATE VIEW ingoing_arrived_view
    AS
    SELECT 
        ingoing.id as id,
        master.product as product,
        master.description as description,
        master.unit_price as price,
        ingoing.quantity as quantity,
        (master.unit_price * ingoing.quantity) as 'total',
        date(ingoing.shipment) as shipment,
        date(ingoing.arrival) as arrival,
        ingoing.arrived as arrived,
        clients.name as supplier_name,
        clients.company as supplier_company,
        clients.contact as supplier_contact,
        clients.email as supplier_email
    FROM ingoing
    INNER JOIN master
    ON ingoing.product = master.id
    INNER JOIN clients
    ON ingoing.supplier = clients.id
    WHERE ingoing.arrived = 1 -- * MODIFIED
    ORDER BY ingoing.timestamp DESC`,
    `CREATE VIEW outgoing_arrived_view
    AS
    SELECT 
        outgoing.id as id,
        master.product as product,
        master.description as description,
        master.unit_price as price,
        outgoing.quantity as quantity,
        (master.unit_price * outgoing.quantity) as 'total',
        date(outgoing.shipment) as shipment,
        outgoing.arrived as arrived,
        clients.name as customer_name,
        clients.company as customer_company,
        clients.contact as customer_contact,
        clients.email as customer_email
    FROM outgoing
    INNER JOIN master
    ON outgoing.product = master.id
    INNER JOIN clients
    ON outgoing.client = clients.id
    WHERE outgoing.arrived = 1 --* MODIFIED
    ORDER BY outgoing.timestamp DESC`,
    `CREATE TRIGGER on_ingoing_checked
    BEFORE UPDATE ON ingoing
    WHEN new.arrived = 1
        BEGIN
            -- UPDATE (ADD) QUANTITY VALUE OF (PRODUCT) FROM MASTER
            UPDATE master
            SET quantity = (
                new.quantity +
                (SELECT quantity FROM master WHERE id = new.product)
            ), timestamp = DATETIME('now')
            WHERE id = new.product;
        END;`,
    `CREATE TRIGGER on_outgoing_checked
    BEFORE UPDATE ON outgoing
    WHEN new.arrived = 1
        BEGIN
            -- UPDATE (SUBSTRACT) QUANTITY VALUE OF (PRODUCT) FROM MASTER
            UPDATE master
            SET quantity = (
                (SELECT quantity FROM master WHERE id = new.product)
                - new.quantity
            ), timestamp = DATETIME('now')
            WHERE id = new.product;
        END;`,
    `CREATE TRIGGER on_master_item_updated
    AFTER UPDATE ON master
    BEGIN
        UPDATE master SET timestamp = DATETIME('now') WHERE id = old.id;
    END;`,
    `CREATE TRIGGER category_on_update
    AFTER UPDATE ON categories
    BEGIN
        UPDATE categories SET timestamp = DATETIME('now') WHERE id = old.id;
    END;`,
    `CREATE TRIGGER warehouse_on_update
    AFTER UPDATE ON warehouses
    BEGIN
        UPDATE warehouses SET timestamp = DATETIME('now') WHERE id = old.id;
    END;`,
    `CREATE TRIGGER clients_on_update
    AFTER UPDATE ON clients
    BEGIN
        UPDATE clients SET timestamp = DATETIME('now') WHERE id = old.id;
    END;`,
    `CREATE TRIGGER "ingoing_on_delete"
    BEFORE DELETE ON ingoing
    BEGIN
        INSERT INTO ingoing_discarded
        VALUES
        (
            (SELECT substr(u, 1, 8) || '-' || substr(u, 9, 4) || '-4' || substr(u, 13, 3) || '-' || v || substr(u, 17, 3) || '-' || substr (u, 21, 12) AS RANDOMUUID FROM(SELECT LOWER(hex(randomblob(16))) as u, substr('89ab', abs(random()) % 4 + 1, 1) as v)),
            (SELECT product FROM master WHERE id = old.product),
            old.quantity,
            old.shipment,
            old.arrival,
            old.shipment,
            (SELECT 'name' FROM clients WHERE id = old.supplier),
            (SELECT company FROM clients WHERE id = old.supplier),
            (SELECT 'address' FROM clients WHERE id = old.supplier),
            (SELECT contact FROM clients WHERE id = old.supplier),
            (SELECT email FROM clients WHERE id = old.supplier),
            DATETIME('now')
        );
    END;`,
    `CREATE TRIGGER "outgoing_on_delete"
    BEFORE DELETE ON outgoing
    BEGIN
        INSERT INTO outgoing_discarded
        VALUES
        (
            (SELECT substr(u, 1, 8) || '-' || substr(u, 9, 4) || '-4' || substr(u, 13, 3) || '-' || v || substr(u, 17, 3) || '-' || substr (u, 21, 12) AS RANDOMUUID FROM(SELECT LOWER(hex(randomblob(16))) as u, substr('89ab', abs(random()) % 4 + 1, 1) as v)),
            (SELECT product FROM master WHERE id = old.product),
            old.quantity,
            old.shipment,
            old.arrived,
            (SELECT 'name' FROM clients WHERE id = old.client),
            (SELECT company FROM clients WHERE id = old.client),
            (SELECT 'address' FROM clients WHERE id = old.client),
            (SELECT contact FROM clients WHERE id = old.client),
            (SELECT email FROM clients WHERE id = old.client),
            DATETIME('now')
        );
    END;`,
    `CREATE TRIGGER "master_on_delete"
    BEFORE DELETE ON master
    BEGIN
        INSERT INTO master_discarded
        VALUES(
            (SELECT substr(u, 1, 8) || '-' || substr(u, 9, 4) || '-4' || substr(u, 13, 3) || '-' || v || substr(u, 17, 3) || '-' || substr (u, 21, 12) AS RANDOMUUID FROM(SELECT LOWER(hex(randomblob(16))) as u, substr('89ab', abs(random()) % 4 + 1, 1) as v)),
            old.product,
            old.description,
            (SELECT label FROM categories WHERE id = old.category),
            old.quantity,
            old.max,
            old.unit_price,
            (SELECT label FROM warehouses WHERE id = old.warehouse),
            (SELECT 'location' FROM warehouses WHERE id = old.warehouse),
            DATETIME('now')
        );
    END;`,
    `CREATE VIEW IF NOT EXISTS "inventory_summary" AS
    SELECT
        COUNT(id) as total_items,
        --inventory
        (SELECT SUM(quantity) FROM inventory) as total_inventory_quantity, --TOTAL QUANTITY (master)
        (SELECT SUM(unit_price) FROM inventory) as total_price, --TOTAL PRICE (master)
        (SELECT SUM(max_quantity) FROM inventory) as total_max, --TOTAL MAX ITEM (master)
        (SELECT MAX(quantity) FROM inventory) as max_quantity, -- MAX QUANTITY (master)
        (SELECT MAX(max_quantity) FROM inventory) as max_most, -- MAX MOST ITEM (master)
        (SELECT MAX(unit_price) FROM inventory) as max_price, -- MAX UNIT PRICE (master)
        -- MAX QUANTITY (product)
        (
            SELECT
                product
            FROM inventory
            WHERE quantity = 
                (
                    SELECT
                        MAX(quantity)
                    FROM inventory
                )
        ) as max_quantity_product,
        -- MAX UNIT PRICE (Product)
        (
            SELECT
                product
            FROM inventory
            WHERE
                unit_price =
                (
                    SELECT
                        MAX(unit_price)
                    FROM inventory
                )
        ) as max_priced_item,
        -- MAX MOST ITEM (product)
        (
            SELECT
                product
            FROM inventory
            WHERE max_quantity =
            (
                SELECT
                MAX(max_quantity)
                FROM inventory
            )
        ) as max_most_item
    FROM inventory`,
    `CREATE VIEW IF NOT EXISTS "ingoing_summary" AS
    SELECT
        COUNT(*) as total_items, -- TOTAL INGOING ITEMS
        SUM(quantity) total_quantity, -- TOTAL QUANTITY ITEMS
        SUM(total) as total_price, -- TOTAL PRICE ITEMS
        (
            SELECT
                COUNT(id)
            FROM ingoing
            WHERE arrived = 0
        ) as unaudited, -- UNAUDITED
        (
            SELECT
                COUNT(id)
            FROM ingoing
            WHERE arrived = 1
        ) as audited, -- AUDITED
        MAX(quantity) as max_quantity, -- MAX QUANTITY
        MAX(total) as max_price, -- MAX PRICE
        (
            SELECT
                product
            FROM ingoing_view
            WHERE quantity = (
                SELECT MAX(quantity) FROM ingoing_view
            )
        ) as max_quantity_item, -- MAX QUANTITY ITEM
        (
            SELECT
                product
            FROM ingoing_view
            WHERE total = (
                SELECT MAX(total) FROM ingoing_view
            )
        ) as max_price_item -- MAX PRICE ITEM
    FROM ingoing_view`,
    `CREATE VIEW IF NOT EXISTS "outgoing_summary" AS
    SELECT
        COUNT(*) as total_items, -- TOTAL INGOING ITEMS
        SUM(quantity) total_quantity, -- TOTAL QUANTITY ITEMS
        SUM(total) as total_price, -- TOTAL PRICE ITEMS
        (
            SELECT
                COUNT(id)
            FROM outgoing
            WHERE arrived = 0
        ) as unaudited, -- UNAUDITED
        (
            SELECT
                COUNT(id)
            FROM outgoing
            WHERE arrived = 1
        ) as audited, -- AUDITED
        MAX(quantity) as max_quantity, -- MAX QUANTITY
        MAX(total) as max_price, -- MAX PRICE
        (
            SELECT
                product
            FROM outgoing_view
            WHERE quantity = (
                SELECT MAX(quantity) FROM outgoing_view
            )
        ) as max_quantity_item, -- MAX QUANTITY ITEM
        (
            SELECT
                product
            FROM outgoing_view
            WHERE total = (
                SELECT MAX(total) FROM outgoing_view
            )
        ) as max_price_item -- MAX PRICE ITEM
    FROM outgoing_view`,
    ``
]