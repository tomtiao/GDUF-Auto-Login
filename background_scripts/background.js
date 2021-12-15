'use strict';

let defaultUsername = '123456789',
    defaultPassword = '123456',
    autoClose = true,
    showPasswordOnPopUp = false,
    backgroundAutoLogin = true,
    loginPageNotice = '',
    logoutPageNotice = '',
    lastLoginStatus = '';

const handleInstall = (/** @type {chrome.runtime.InstalledDetails} */ request) => {
    if (request.reason == 'install'
        || request.reason == 'update') { // make sure new options are available after update
        chrome.storage.sync.get({
            username: defaultUsername,
            password: defaultPassword,
            autoClose,
            showPasswordOnPopUp,
            loginPageNotice,
            logoutPageNotice,
            backgroundAutoLogin,
            lastLoginStatus
        }, (items) => {
            const {
                username,
                password,
                autoClose,
                showPasswordOnPopUp,
                loginPageNotice,
                logoutPageNotice,
                backgroundAutoLogin,
                lastLoginStatus
            } = items;

            chrome.storage.sync.set({
                username,
                password,
                autoClose,
                showPasswordOnPopUp,
                loginPageNotice,
                logoutPageNotice,
                backgroundAutoLogin,
                lastLoginStatus
            }, () => {
                if (request.reason == 'install') {
                    console.debug(`Username and password set to ${defaultUsername} and ${defaultPassword}`);
                    console.debug(`Automatically close the tab after login is set to ${autoClose}`);
                    console.debug(`Show password in the pop-up menu is set to ${showPasswordOnPopUp}`);
                    console.debug(`Auto background login is set to ${backgroundAutoLogin}`);
                    chrome.runtime.openOptionsPage(
                        () => console.debug(`First time launch, opening options.`)
                    );
                }
                
                chrome.tabs.create({
                    url: 'whats-new.html'
                });

                initialBackgroundLogin();
            });
        });
    }
};

chrome.runtime.onInstalled.addListener(handleInstall);

// message from content.js, close the tab after login
const /** @type {(message: { closeTab: boolean }, sender: chrome.runtime.MessageSender) => void} */ handleCloseTab = (message, sender) => {
    if (message.closeTab && sender.tab && sender.tab.id) {
        chrome.tabs.remove(sender.tab.id);
    }
};

chrome.runtime.onMessage.addListener(handleCloseTab);
