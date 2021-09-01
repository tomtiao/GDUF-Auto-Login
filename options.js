'use strict';

function handleUserInput() {
    const username_input = document.querySelector(`input[id='username']`);
    const password_input = document.querySelector(`input[id='password']`);
    const checkboxs = document.querySelectorAll(`input[type='checkbox']`);

    // set controls string
    document.querySelector(`label[for='username']`).textContent = chrome.i18n.getMessage('username');
    document.querySelector(`label[for='password']`).textContent = chrome.i18n.getMessage('password');
    document.querySelector(`button#saveBtn`).textContent = chrome.i18n.getMessage('save');
    document.querySelector(`label[for='autoClose']`).textContent = chrome.i18n.getMessage('autoCloseMessage');
    document.querySelector(`label[for='showPasswordOnPopUp']`).textContent = chrome.i18n.getMessage('showPasswordOnPopUp');

    // set controls value
    chrome.storage.sync.get(['username', 'password', 'autoClose', 'showPasswordOnPopUp'], (object) => {
        const { username: currentUsername, password: currentPassword } = object;
        username_input.value = currentUsername;
        password_input.value = currentPassword;
        checkboxs.forEach(checkboxs => {
            checkboxs.checked = object[checkboxs.id];
        });
    });

    const status = document.querySelector('#status');

    document.querySelector('form').addEventListener('submit', e => {
        e.preventDefault();

        chrome.storage.sync.set({ username: username_input.value, password: password_input.value });
        console.log(`Current username and password set to ${username_input.value} and ${password_input.value}.`);

        status.textContent =
            chrome.i18n.getMessage('accountStatus', [username_input.value, password_input.value]);
    });

    const checkboxFunc = {
        autoClose: e => {
            if (e.target.checked) {
                chrome.storage.sync.set({ autoClose: true });
            } else {
                chrome.storage.sync.set({ autoClose: false });
            }
            status.textContent =
                chrome.i18n.getMessage('autoCloseTab', e.target.checked ?
                    chrome.i18n.getMessage('on') :
                    chrome.i18n.getMessage('off')
                );
        },
        showPasswordOnPopUp: e => {
            if (e.target.checked) {
                chrome.storage.sync.set({ showPasswordOnPopUp: true });
            } else {
                chrome.storage.sync.set({ showPasswordOnPopUp: false });
            }
            status.textContent =
                chrome.i18n.getMessage('showPassword', e.target.checked ?
                    chrome.i18n.getMessage('on') :
                    chrome.i18n.getMessage('off')
                );
        }
    };

    // set checkbox onchange
    checkboxs.forEach(checkbox => {
        checkbox.addEventListener('change', e => checkboxFunc[e.target.id](e));
    });
}

handleUserInput();