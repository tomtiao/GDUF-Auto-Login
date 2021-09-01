function main() {
    const loginNoticeTitle = document.getElementById('notice-login-title');
    loginNoticeTitle.textContent = chrome.i18n.getMessage('loginNoticeTitle');

    const logoutNoticeTitle = document.getElementById('notice-logout-title');
    logoutNoticeTitle.textContent = chrome.i18n.getMessage('logoutNoticeTitle');

    chrome.storage.sync.get(['loginPageNotice', 'logoutPageNotice'], ({
        loginPageNotice,
        logoutPageNotice
    }) => {
        const loginNoticeContent = document.getElementById('notice-login-content');
        const logoutNoticeContent = document.getElementById('notice-logout-content');
        
        loginNoticeContent.textContent = loginPageNotice;
        logoutNoticeContent.textContent = logoutPageNotice;
    });
}

main();