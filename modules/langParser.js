const fs = require("fs")
const format = require('printf')
/**
 * 
 * @param {import("fs").PathLike} filename 
 * @returns {{[key:string]:string}}
 */
const parser = (filename) => {
    const text = fs.readFileSync(filename).toString()
    /**
     * @type {string[]}
     */
    let tmpArr = text.split("\n")
    tmpArr = tmpArr.filter(line => (line.length > 0 && !line.startsWith("##") && line != "\r"))
    /**
     * @type {{[key:string]:string}}
     */
    let dict = {}
    for (const d of tmpArr) {
        const equalIndex = d.indexOf("=")
        const key = d.substring(0, equalIndex)
        let value = d.substring(equalIndex + 1)
        if (value.includes("\t")) {
            value = value.match(/.*?\t/)[0].substring(0, value.match(/.*?\t/)[0].length - 1)
        }
        dict[key] = value
    }
    return dict
}
/**
 * 
 * @param {{[key:string]:string}} parsedObject 
 * @param {string} key 
 * @param {string[]} params 
 * @param {boolean} recursive 再帰展開を行うか。
 * @returns {string}
 */
const formatter = (parsedObject, key, params, recursive = false) => {
    if (!recursive)
        return format(parsedObject[key], ...params)
    let tmpParam = JSON.parse(JSON.stringify(params))
    let c = 0;
    for (const k of params) {
        if (k.startsWith("%") && (k.substring(1) in parsedObject)) {
            tmpParam[c] = formatter(parsedObject, k.substring(1), newArray((parsedObject[k.substring(1)].match(new RegExp("%", "g")) || []).length,"(null)"), true)
        }
        c += 1
    }
    console.log(tmpParam)
    return format(parsedObject[key], ...tmpParam)
}
exports.parser = parser
exports.formatter = formatter
/**
 * 
 * @param {number} size 
 * @param {any} value 
 * @returns {any[]}
 */
function newArray(size,value) {
    let arr = new Array(size)
    for (let i = 0; i < size; i++) {
        arr[i] = value
    }
    return arr
}