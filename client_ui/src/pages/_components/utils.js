export const pageLeaveHandler = async (message = "Some item(s) are still active, do you want to proceed?") => {
    const dialog = await window.dialogs.message({
        type: 'warning',
        title: 'Leaving Page',
        buttons: ['OK', 'Cancel'],
        message,
    });
    if (dialog.response === 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * DATE PARSING
 */
//CONVERT DATE TO CLIENT READABLE
export const dateClient = (dateString) => {
    const date = new Date(dateString);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}
//CONVERT DATE TO SERVER DATE
export const dateServer = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

/**PARSE COOKIE */

/**INITIAL VALUES */
export const INVENTORY = {
    id: "",
    product: "",
    description: "",
    category: "",
    max: 1,
    quantity: 1,
    unit_price: 0,
    warehouse: "",
};

export const IMPORTED = {
    id: "",
    product: '',
    quantity: 1,
    shipment: dateClient(Date.now()),
    arrival: dateClient(Date.now()),
    arrived: false,
    supplier: ''
}

export const EXPORTED = {
    id: "",
    product: '',
    quantity: 1,
    shipment: dateClient(new Date(Date.now())),
    arrived: false,
    client: ''
}

export const CATEGORY = {
    id: '',
    label: ''
}
export const WAREHOUSE = {
    id: '',
    label: '',
    location: ''
}

export const SUPPLIER = {
    id: '',
    name: '',
    company: 'N/A',
    address: 'N/A',
    contact: '',
    email: '',
    type: 'supplier'
}
export const CUSTOMER = {
    id: '',
    name: '',
    company: 'N/A',
    address: 'N/A',
    contact: '',
    email: '',
    type: 'customer'
}

/**
 * 
 * @param {string} type 
 * @returns Object<any> 
 */
export function clear(type) {
    switch (type) {
        case 'inventory':
            return { ...INVENTORY };
        case 'imports':
            return { ...IMPORTED }
        case 'exports':
            return { ...EXPORTED }
        case 'category':
            return { ...CATEGORY }
        case 'warehouse':
            return { ...WAREHOUSE }
        case 'supplier':
            return { ...SUPPLIER }
        case 'customer':
            return { ...CUSTOMER }
    }
}

/**
 * RANDOM NUMBERS WITH LIMIT
 * @params {{min:number|null, max:number}} param0
 */
export function genRandom({ min = null, max = 5 }) {
    if (min) {
        if (min < max) {
            const difference = max - min;
            const rand = Math.random()
            return Math.floor(rand * difference) + min
        } else {
            return 0;
        }
    } else {
        const rand = Math.random() * max;
        return Math.floor(rand)
    }
}
