/**
 * get values from the browser storage
 * @param {string[]} keys 
 * @returns {Promise<Record<string, unknown>>} values
 */
const getValue = async (keys) => new Promise(resolve => chrome.storage.sync.get(keys, resolve));

export {
    getValue
}