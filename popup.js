'use strict';

function sendLogoutRequest() {
    
}

function setUp() {
    chrome.storage.sync.get(['username', 'password'], ({ username, password }) => {
        const usernameText = document.querySelector('.username');
        usernameText.textContent = `${chrome.i18n.getMessage('username')} ${username}`;

        chrome.storage.sync.get(['showPasswordOnPopUp'], ({ showPasswordOnPopUp }) => {
            const passwordText = document.querySelector('.password');

            if (showPasswordOnPopUp) {
                passwordText.textContent = `${chrome.i18n.getMessage('password')} ${password}`;
            } else {
                passwordText.textContent = ``;
            }
        });
    });

    const optionBtn = document.getElementById('optionBtn');
    optionBtn.textContent = chrome.i18n.getMessage('openSettings');

    optionBtn.addEventListener('click', async () => {
        chrome.runtime.openOptionsPage();
    });

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.textContent = chrome.i18n.getMessage('logout');



    const noticeLink = document.querySelector('.notice-link');
    noticeLink.textContent = chrome.i18n.getMessage('notice');
}

setUp();