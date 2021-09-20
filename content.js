'use strict';

/**
 * Send login request
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{ code: string; message: string } & Record<string, string>>} the response object
 */
async function sendLoginRequest(username, password) {
    const REQUEST_URL = new URL(`/quickauth.do`, window.location.origin);

    const pageParams = new URLSearchParams(window.location.search);
    const VERSION = 0;
    const PORTALPAGEID = 1;

    const params = {
        userid: username,
        passwd: password,
        wlanuserip: pageParams.get('wlanuserip'),
        wlanacname: pageParams.get('wlanacname'),
        wlanacIp: '',
        ssid: '',
        vlan: pageParams.get('vlan'),
        mac: encodeURIComponent(pageParams.get('mac')),
        version: VERSION,
        portalpageid: PORTALPAGEID,
        timestamp: Date.now(),
        portaltype: ''
    };

    const request_params = new URLSearchParams(params);

    const url = new URL(`?${request_params.toString()}`, REQUEST_URL);

    const res = await fetch(url, { credentials: 'same-origin' })
    const object = await res.json();
    return object;
};

/**
 * Get notice
 * @param {'login' | 'logout'} type page type
 */
function getNotice(type) {
    if (type === 'login') {
        const loginPageNotice = document.querySelector('div[class="modal-body"] > div[class="title"]');

        chrome.storage.sync.set({
            loginPageNotice: loginPageNotice.textContent.trim().replace(/\s+/g, '\n')
        });
    } else {
        const logoutPageNotice = document.getElementById('model_notice');
        
        chrome.storage.sync.set({
            logoutPageNotice: logoutPageNotice.textContent.trim().replace(/\s+/g, '\n')
        });
    }
}

/**
 * get values from the browser storage
 * @param {string[]} keys 
 * @returns {Promise<Record<string, unknown>>} values
 */
const getValue = async (keys) => new Promise(resolve => chrome.storage.sync.get(keys, resolve));

const start = async () => {
    if (window.location.href.includes('logout.html')) { // logout page, logout.html
        // close the tab after logon if user had chosen to
        getNotice('logout');

        getValue(['autoClose'])
            .then(({ autoClose }) => {
                if (autoClose) {
                    chrome.runtime.sendMessage({ closeTab: true });
                }
            });
    } else if (window.location.href.includes('portal.do')) {
        // login page, /portal.do*
        getNotice('login');

        let { username, password } = await getValue(['username', 'password']);

        if (username && password) {
            let object;

            try {
                object = await sendLoginRequest(username, password);
            } catch (reason) {
                alert(chrome.i18n.getMessage('errorOnRequest'), [reason]);
                console.error(`Encountered error when sending request: ${reason}`);
            }
            
            if (object.code == 0) {
                getValue(['autoClose'])
                    .then(({ autoClose }) => {
                        if (autoClose) {
                            chrome.runtime.sendMessage({ closeTab: true });
                        }
                    });
            } else {
                const ERROR = chrome.i18n.getMessage('errorOnLogin', object.message);
                
                if (confirm(`${ERROR} ${chrome.i18n.getMessage('tryAgain')}`)) {
                    await start();
                }
            }
        } else {
            const INVALID_INPUT_ALERT =
            `${chrome.i18n.getMessage('extInvalidInputAlert')} 
            ${username} ${password}`;
            alert(INVALID_INPUT_ALERT);
            chrome.runtime.openOptionsPage();
        }
    } else {
        // user manually goes to the logout page, portalLogout.do*.
        // do nothing but save the notice
        getNotice('logout');
    }
}

start()
    .catch((error) => {
        alert(chrome.i18n.getMessage('errorFromExtension', [error]));
        console.error(`Encountered error when trying to login: ${error}`);
    });