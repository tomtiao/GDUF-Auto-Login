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
    
                            const submit_btn = document.querySelector('button#loginsubmit');
    
                            submit_btn.click();
    
                        } else {
                            alert(`${chrome.i18n.getMessage('extInvalidInputAlert')}
                            ${loginUsername} ${loginPassword}`);
                            chrome.runtime.openOptionsPage();
                        }
                    });
                };
            }

            if (document.readyState == 'loading') {
                self.addEventListener('DOMContentLoaded', work);
            } else {
                work();
            }
        }
    }
};
app.start();