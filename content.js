const app = {
    start: () => {
        let work;
        if (window.location.href.includes('logout.html')) {
            // close the tab after logon if user had chosen to
            work = function () {
                chrome.storage.sync.get(['autoClose'], ({ autoClose }) => {
                    if (autoClose) {
                        chrome.runtime.sendMessage({ closeTab: true });
                    }
                });
            };
        } else {
            // needs login
            work = function () {
                let login_username;
                let login_password;

                chrome.storage.sync.get(['username', 'password'], ({ username, password }) => {
                    login_username = username;
                    login_password = password;

                    if (login_username && login_password) {
                        const REQUEST_URL = new URL(`/quickauth.do`, window.location.origin);
                        
                        const pages_params = new URLSearchParams(window.location.search);
                        const VERSION = 0,
                              PORTALPAGEID = 1;

                        const params = {
                            userid: login_username,
                            passwd: login_password,
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

                        fetch(url, { credentials: 'same-origin' })
                            .then(res => res.json())
                            .then((object) => {
                                if (( +object.code ) === 0) {
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
                            })
                            .catch(reason => {
                                alert(chrome.i18n.getMessage('errorOnRequest'), [ reason ]);
                                console.error(`Encountered error when sending request: ${reason}`);
                            });
                    } else {
                        const messages = {
                            INVALID_INPUT: `${chrome.i18n.getMessage('extInvalidInputAlert')}
                            ${login_username} ${login_password}`,
                        };

                        alert(messages.INVALID_INPUT);
                        chrome.runtime.openOptionsPage();
                    }
                });
            };
        }
        work();
    }
};

try {
    app.start();
} catch (error) {
    alert(chrome.i18n.getMessage('errorFromExtension', [ error ]));
    console.error(`Encountered error when trying to login: ${error}`);
}