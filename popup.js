const username_text = document.querySelector('.username');
const password_text = document.querySelector('.password');
const optionBtn = document.getElementById("optionBtn");

chrome.storage.sync.get(['username', 'password'], ({ username, password }) => {
    username_text.textContent = `${chrome.i18n.getMessage('username')} ${username}`;
    chrome.storage.sync.get(['showPasswordOnPopUp'], ({ showPasswordOnPopUp }) => {
        if (showPasswordOnPopUp) {
            password_text.textContent = `${chrome.i18n.getMessage('password')} ${password}`;
        } else {
            password_text.textContent = ``;
        }
    });
});

optionBtn.textContent = chrome.i18n.getMessage('openSettings');

optionBtn.addEventListener('click', async () => {
    chrome.runtime.openOptionsPage();
});