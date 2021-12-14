/**
 * get values from the browser storage
 */
const /** @type {<T>(keys: string[]) => Promise<Record<string, T>>} */ getValue =
    async (keys) => new Promise(resolve => chrome.storage.sync.get(keys, resolve));

export {
    getValue
}