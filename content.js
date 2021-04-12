const app = {
    start: () => {
        if (self !== undefined) {
            // browser
            let work;
            if (self.location.href.includes('logout.html')) {
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
                    let loginUsername;
                    let loginPassword;

                    chrome.storage.sync.get(['username', 'password'], ({ username, password }) => {
                        loginUsername = username;
                        loginPassword = password;

                        if (loginUsername && loginPassword) {
                            const username_input = document.querySelector(`input[id='userid']`);
                            const password_input = document.querySelector(`input[id='passwd']`);
    
                            username_input.value = loginUsername;
                            password_input.value = loginPassword;
    
                            window.checkSubmit(); // available in portalUtil.js, execute this will send the login request
    
                        } else {
                            alert(`${chrome.i18n.getMessage('extInvalidInputAlert')}
                            ${loginUsername} ${loginPassword}`);
                            chrome.runtime.openOptionsPage();
                        }
                    });
                };
            }

            if (document.readyState == 'loading') {
                document.head.addEventListener('load', e => {
                    if (e.target.tagName === 'SCRIPT'
                    && e.target.endsWith('portalUtil.js')) {
                        work();
                    }
                });
            } else {
                work();
            }
        }
    }
};
app.start();