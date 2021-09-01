'use strict';

/**
 * Send login request
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<boolean>} return true if the request is success, false otherwise.
 */
async function sendLoginRequest(username, password) {
    const REQUEST_URL = new URL(`/quickauth.do`, window.location.origin);

    const pages_params = new URLSearchParams(window.location.search);
    const VERSION = 0;
    const PORTALPAGEID = 1;

    const params = {
        userid: username,
        passwd: password,
        wlanuserip: pages_params.get('wlanuserip'),
        wlanacname: pages_params.get('wlanacname'),
        wlanacIp: '',
        ssid: '',
        vlan: pages_params.get('vlan'),
        mac: encodeURIComponent(pages_params.get('mac')),
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
            loginPageNotice: loginPageNotice.textContent.trim()
        });
    } else {
        const logoutPageNotice = document.getElementById('model_notice');
        
        chrome.storage.sync.set({
            logoutPageNotice: logoutPageNotice.textContent.trim()
        });
    }
}

const app = {
    start: async () => {
        if (window.location.href.includes('logout.html')) { // logout page, logout.html
            // close the tab after logon if user had chosen to
            (function () {
                getNotice('logout');
                chrome.storage.sync.get(['autoClose'], ({ autoClose }) => {
                    if (autoClose) {
                        chrome.runtime.sendMessage({ closeTab: true });
                    }
                });
            })();
        } else {
            // login page, /portal.do*
            getNotice('login');
            chrome.storage.sync.get(['username', 'password'], async function work({ username, password }) {
                if (username && password) {
                    let object;
                    try {
                        object = await sendLoginRequest(username, password);
                    } catch (reason) {
                        alert(chrome.i18n.getMessage('errorOnRequest'), [reason]);
                        console.error(`Encountered error when sending request: ${reason}`);
                    }
                    if (object.code == 0) {
                        chrome.storage.sync.get(['autoClose'], ({ autoClose }) => {
                            if (autoClose) {
                                chrome.runtime.sendMessage({ closeTab: true });
                            }
                        });
                    } else {
                        const messages = {
                            ERROR:
                                `${chrome.i18n.getMessage('errorOnLogin', object.message)} ${chrome.i18n.getMessage('tryAgain')}`
                        };
                        if (confirm(messages.ERROR)) {
                            work();
                        }
                    }
                } else {
                    const messages = {
                        INVALID_INPUT: `${chrome.i18n.getMessage('extInvalidInputAlert')}
                        ${username} ${password}`,
                    };
                    alert(messages.INVALID_INPUT);
                    chrome.runtime.openOptionsPage();
                }
            });
        }
    }
};

app.start()
.catch((error) => {
    alert(chrome.i18n.getMessage('errorFromExtension', [error]));
    console.error(`Encountered error when trying to login: ${error}`);
});