'use strict';

let defaultUsername = '123456789',
    defaultPassword = '123456',
    autoClose = true,
    showPasswordOnPopUp = false,
    loginPageNotice = '',
    logoutPageNotice = '';

const handleInstall = (/** @type {chrome.runtime.InstalledDetails} */ request) => {
    if (request.reason == 'install') {
        chrome.storage.sync.set({
            username: defaultUsername,
            password: defaultPassword,
            autoClose,
            showPasswordOnPopUp,
            loginPageNotice
        });
        console.debug(`Default username and password set to ${defaultUsername} and ${defaultPassword}`);
        console.debug(`Automatically close the tab after login is set to ${autoClose}`);
        console.debug(`Show password in the pop-up menu is set to ${showPasswordOnPopUp}`);
        chrome.storage.sync.set({ loginPageNotice, logoutPageNotice });
        chrome.runtime.openOptionsPage(
            () => console.debug(`First time launch, opening options.`)
        );
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
