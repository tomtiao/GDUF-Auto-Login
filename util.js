/**
 * get values from the browser storage
 */
const /** @type {<T>(keys: string[]) => Promise<Record<string, T>>} */ getValue =
    async (keys) => new Promise(resolve => chrome.storage.sync.get(keys, resolve));

/**
 * create a basic notification
 * @param {string} id notification id
 * @param {string} message
 * @param {chrome.notifications.ButtonOptions[]} [buttons]
 */
const createBasicNotification = async (id, message, buttons) => {
    const extName = chrome.i18n.getMessage('extName');
    chrome.notifications.create(
        id,
        {
            type: 'basic',
            title: extName,
            message: message,
            iconUrl: chrome.runtime.getURL('../icon500x500.png'),

            eventTime: Date.now(),
            buttons
        }
    );
};

export {
    getValue,
    createBasicNotification
}