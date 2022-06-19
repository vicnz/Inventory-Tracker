/**
 * Slice the Row Array for Pagination
 * @param {Array<any>} data the array data to be sliced
 * @param {number} size pagination width
 * @returns {Array<Array<any>}
 */
function paginate(data, size = 10) {
    return new Promise((res, rej) => {
        try {
            let _start = 0;
            let _size = size
            let _sizeVariant = _size
            let _splited = []
            while (true) {
                const section = data.slice(_start, _size)
                const temp = _size
                _size = _size + _sizeVariant
                _start = temp

                if (section.length <= 0) {
                    break;
                } else {
                    _splited.push(section)
                }
            }
            return res(_splited);
        } catch (e) {
            return rej([])
        }
    });
}

/**
 * Sort Selection
 * @param {Array<any>} data data to search 
 * @param {Number} column which column to search
 * @param {boolean} asc is ascending or false
 * @returns {Array<Array<any>>}
 */
function sort(data, column = 0, asc = true) {
    return new Promise((res, rej) => {
        try {
            if (asc) {
                return res(data.sort((x, y) => (x[column] > y[column]) ? 1 : -1));
            } else {
                return res(data.sort((x, y) => (x[column] < y[column]) ? 1 : -1));
            }
        } catch (err) {
            return rej([])
        }
    })
}

/**
 * Search for String
 * @param {Array<any>} data data to be search upon to
 * @param {string} query query string for search
 * @param {{column: string}} datatype data type
 * @returns {Array<Array<any>>}
 */
function search(data, query, column, type) {
    return new Promise((res, rej) => {
        try {
            //CHECK IF TYPE IS NUMBER OR CURRENCY
            if (type === 'number' || type === 'currency') {
                let conditionOne = new RegExp(/[<>]\d+(\.\d{0,5})?/, 'g')
                let conditionTwo = new RegExp(/\d+(\.\d{0,5})?\s?[~\^]\s?\d+(\.\d{0,5})?/, 'g')

                if (query.match(conditionOne) !== null || query.match(conditionTwo) !== null) {
                    //VALUE EITHER GREATER THAN OR LESS THAN
                    if (query.trim()[0] == "<" || query.trim()[0] == ">") {
                        let number = +query.trim().replace(/[<>]/g, '');
                        let operand = query.trim()[0];
                        return res(
                            data.filter(key => {
                                if (operand == '<') {
                                    return key[column] <= number;
                                } else if (operand == '>') {
                                    return key[column] >= number
                                }
                            })
                        )

                    }
                    //VALUES - BETWEEN
                    else if (query.includes("~")) {
                        let operand = query.split('~')
                        let left = operand[0]
                        let right = operand[1]
                        return res(
                            data.filter(key => {
                                return key[column] > left && key[column] < right
                            })
                        )
                    }
                    //VALUE NOT-BETWEEN
                    else if (query.includes('^')) {
                        let operand = query.split("^")
                        let left = operand[0]
                        let right = operand[1]
                        return res(
                            data.filter(key => {
                                return !(key[column] > left && key[column] < right)
                            })
                        )

                    }
                } else {
                    // IF INVALID OPERAND
                    let searchQuery = query.toString().trim().toLowerCase()
                    let pattern = new RegExp(query, 'gi')
                    pattern = new RegExp(searchQuery, 'gi')
                    return res(data.filter(element => element[column].toString().toLowerCase().match(pattern)))
                }
            }
            //IF TYPE IS DATE
            else if (type === 'date') {
                let condition1 = new RegExp(/[<>]\d{1,2}\/\d{1,2}\/\d{2,4}/, 'gi')
                let condition2 = new RegExp(/\d{1,2}\/\d{1,2}\/\d{2,4}\s?[~\^]\s?\d{1,2}\/\d{1,2}\/\d{2,4}/, 'gi')

                if (query.match(condition1) !== null || query.match(condition2) !== null) {
                    if (query.trim()[0] == '<' || query.trim()[0] == '>') {
                        const date = query.trim().replace(/[<>]/g, '')
                        const toDate = new Date(date)

                        return res(data.filter(key => {
                            if (query.trim()[0] == '<') {
                                const conditionDate = new Date(key[column])
                                return conditionDate < toDate
                            } else if (query.trim()[0] == '>') {
                                const conditionDate = new Date(key[column])
                                return conditionDate > toDate
                            }
                        }))

                    } else if (query.includes('~')) {
                        const sliced = query.trim().split('~')
                        let left = new Date(sliced[0].trim())
                        let right = new Date(sliced[1].trim())

                        return res(
                            data.filter(key => {
                                let conditionDate = new Date(key[column])
                                return left < conditionDate && conditionDate < right
                            })
                        )
                    } else if (query.includes('^')) {
                        const sliced = query.trim().split('^')
                        let left = new Date(sliced[0].trim())
                        let right = new Date(sliced[1].trim())

                        return res(
                            data.filter(key => {
                                let conditionDate = new Date(key[column])
                                return !(left < conditionDate && conditionDate < right)
                            })
                        )
                    }
                } else {
                    let searchQuery = query.trim()
                    let dateParsed = new Date(searchQuery).toLocaleDateString()
                    return res(data.filter(element => {
                        let dataDate = new Date(element[column]).toLocaleDateString()
                        return dataDate == dateParsed;
                    }));
                }
            }
            //IF NOT NUMBER THEN PROCEED TO FILTER
            else {
                let searchQuery = query.toString().trim().toLowerCase()
                let pattern = new RegExp(query, 'gi')
                pattern = new RegExp(searchQuery, 'gi')
                return res(data.filter(element => element[column].toString().toLowerCase().match(pattern)))

            }
        } catch (err) {
            return rej([])
        }
    })
}
// function search(data, query, column) {

//     return new Promise((res, rej) => {
//         try {
//             let searchQuery = query.toString().trim().toLowerCase()
//             let pattern = new RegExp(query, 'gi')
//             pattern = new RegExp(searchQuery, 'gi')
//             return res(data.filter(element => element[column].toString().toLowerCase().match(pattern)))
//         } catch (err) {
//             return rej([])
//         }
//     });
// }

/**
 * Parse if Format (Type) is (currency)
 * @param {string} type 
 * @param {any} value 
 * @returns 
 */

function parseColumnData(type, value) {
    switch (type) {
        case 'string':
            return value
        case 'currency':
            return "" + value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
        case 'date':
            return new Date(value).toLocaleDateString();
        case 'boolean':
            return (value === 1)
        case 'number':
            return +value
        default:
            return value;
    }
}


export {
    paginate,
    search,
    sort,
    parseColumnData as parseColumn
}