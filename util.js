/**
 * get values from the browser storage
 */
const /** @type {<T>(keys: string[]) => Promise<Record<string, T>>} */ getValue =
    async (keys) => new Promise(resolve => chrome.storage.sync.get(keys, resolve));

/**
 * Return the search parameters of the url
 * @param {string} url 
 * @return {URLSearchParams}
 */
function getParamsOf(url) {
    return new URLSearchParams(url);
}

export {
    getValue,
    getParamsOf
}