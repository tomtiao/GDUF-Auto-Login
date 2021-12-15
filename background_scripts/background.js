'use strict';

let defaultUsername = '123456789',
    defaultPassword = '123456',
    autoClose = true,
    showPasswordOnPopUp = false,
    backgroundAutoLogin = false,
    loginPageNotice = '',
    logoutPageNotice = '';

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
            backgroundAutoLogin
        }, (items) => {
            const {
                username,
                password,
                autoClose,
                showPasswordOnPopUp,
                loginPageNotice,
                logoutPageNotice,
                backgroundAutoLogin
            } = items;

            chrome.storage.sync.set({
                username,
                password,
                autoClose,
                showPasswordOnPopUp,
                loginPageNotice,
                logoutPageNotice,
                backgroundAutoLogin
            }, () => {
                if (request.reason == 'install') {
                    console.debug(`Username and password set to ${username} and ${password}`);
                    console.debug(`Automatically close the tab after login is set to ${autoClose}`);
                    console.debug(`Show password in the pop-up menu is set to ${showPasswordOnPopUp}`);
                    console.debug(`Auto background login is set to ${backgroundAutoLogin}`);
                    chrome.runtime.openOptionsPage();
                }
                
                chrome.tabs.create({
                    url: 'whats-new.html'
                });
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
