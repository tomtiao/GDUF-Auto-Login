let username = '123456789',
    password = '123456',
    autoClose = true;

chrome.runtime.onInstalled.addListener(object => {
    if (object.reason == 'install') {
        chrome.storage.sync.set({ username, password, autoClose });
        console.log(`Default username and password set to ${username} and ${password}`);
        console.log(`Automatically close the tab after login is set to ${autoClose}`);
        chrome.runtime.openOptionsPage(() => {
            console.log(`First time launch, opening options.`);
        });
    }
});

// close the tab after login
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.closeTab) {
        chrome.tabs.remove(sender.tab.id);
    }
})