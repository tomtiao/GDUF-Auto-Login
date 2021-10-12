'use strict';
const stringifyValue = (/** @type {Record<string, unknown>} */ o) =>
    Object.fromEntries(
        Object.entries(o)
        .map(([k, v]) => [k, v + ''])
    );
/**
 * Send login request
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{ code: string; message: string } & Record<string, unknown>>} the response object
 */
async function sendLoginRequest(username, password) {
    
    const pageParams = new URLSearchParams(window.location.search);
    
    const VERSION = 0;
    const PORTAL_PAGE_ID = 1;

    const params = stringifyValue({
        userid: username,
        passwd: password,
        wlanuserip: pageParams.get('wlanuserip') || '',
        wlanacname: pageParams.get('wlanacname') || '',
        wlanacIp: '',
        ssid: '',
        vlan: pageParams.get('vlan') || '',
        mac: encodeURIComponent(pageParams.get('mac') || ''),
        version: VERSION,
        portalpageid: PORTAL_PAGE_ID,
        timestamp: Date.now(),
        portaltype: ''
    });

    const requestParams = new URLSearchParams(params);

    const requestUrl = new URL(`${window.location.origin}/quickauth.do?${requestParams}`);

    const res = await fetch(requestUrl.toString(), { credentials: 'same-origin' });
    return await res.json();
};

/**
 * Fetch latest notice
 * @param {'login' | 'logout'} type page type
 */
function fetchNotice(type) {
    if (type === 'login') {
        const /** @type {HTMLDivElement | null} */ loginPageNotice = document.querySelector('div[class="modal-body"] > div[class="title"]');
        if (!loginPageNotice) {
            console.error('unable to find loginPageNotice.');
            return;
        }

        chrome.storage.sync.set({
            // @ts-ignore
            loginPageNotice: loginPageNotice.textContent.trim().replace(/\s+/g, '\n')
        });
    } else {
        const /** @type {HTMLDivElement | null} */ logoutPageNotice = document.querySelector('#model_notice');
        if (!logoutPageNotice) {
            console.error('unable to find logoutPageNotice.');
            return;
        }
        
        chrome.storage.sync.set({
            // @ts-ignore
            logoutPageNotice: logoutPageNotice.textContent.trim().replace(/\s+/g, '\n')
        });
    }
}

/**
 * get values from the browser storage
 */
const /** @type {<T>(keys: string[]) => Promise<Record<string, T>>} */ getValue =
    async (keys) => new Promise(resolve => chrome.storage.sync.get(keys, resolve));

const closeTabIfSetAutoClose = async () => {
    const /** @type {Record<string, boolean>} */ { autoClose } = await getValue(['autoClose']);
    if (autoClose) {
        chrome.runtime.sendMessage({ closeTab: true });
    }
};

const start = async () => {
    if (window.location.href.includes('logout.html')) { // logout page, logout.html
        // close the tab after logon if user had chosen to
        fetchNotice('logout');

        await closeTabIfSetAutoClose();
    } else if (window.location.href.includes('portal.do')) {
        // login page, /portal.do*
        fetchNotice('login');

        const /** @type {Record<string, string>} */ { username, password } = await getValue(['username', 'password']);

        if (username && password) {
            let object;

            try {
                object = await sendLoginRequest(username, password);
            } catch (reason) {
                alert(chrome.i18n.getMessage('errorOnRequest', [reason]));
                console.error(`Encountered error when sending request: ${reason}`);
                return;
            }
            
            if (+object.code === 0) {
                await closeTabIfSetAutoClose();
            } else {
                const error = chrome.i18n.getMessage('errorOnLogin', object.message);
                
                if (confirm(`${error} ${chrome.i18n.getMessage('tryAgain')}`)) {
                    await start();
                }
            }
        } else {
            const invalidInputAlert =
            `${chrome.i18n.getMessage('extInvalidInputAlert')} 
            ${username} ${password}`;
            
            alert(invalidInputAlert);
            chrome.runtime.openOptionsPage();
        }
    } else {
        // user manually goes to the logout page, portalLogout.do*.
        // do nothing but save the notice
        fetchNotice('logout');
    }
}

start()
    .catch((error) => {
        alert(`${chrome.i18n.getMessage('errorFromExtension', [error])}
        ${chrome.i18n.getMessage('errorSuggestion')}`);
        console.error(`Encountered error when trying to login: ${error}`);
    });