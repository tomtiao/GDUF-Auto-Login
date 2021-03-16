function handleUserInput() {
    const username_input = document.querySelector(`input[id='username']`);
    const password_input = document.querySelector(`input[id='password']`);
    const autoClose_checkbox = document.querySelector(`input[id='autoClose']`);

    // set controls string
    document.querySelector(`label[for='username']`).textContent = chrome.i18n.getMessage('username');
    document.querySelector(`label[for='password']`).textContent = chrome.i18n.getMessage('password');
    document.querySelector(`button#saveBtn`).textContent = chrome.i18n.getMessage('save');
    document.querySelector(`label[for='autoClose']`).textContent = chrome.i18n.getMessage('autoCloseMessage');

    // set controls value
    chrome.storage.sync.get(['username', 'password', 'autoClose'], ({ username: currentUsername, password: currentPassword, autoClose }) => {
        username_input.value = currentUsername;
        password_input.value = currentPassword;
        autoClose_checkbox.checked = autoClose;
    });

    const status = document.querySelector('#status');

    document.querySelector('form').addEventListener('submit', e => {
        e.preventDefault();

        chrome.storage.sync.set({ username: username_input.value, password: password_input.value });
        console.log(`Current username and password set to ${username_input.value} and ${password_input.value}.`);

        status.textContent =
            chrome.i18n.getMessage('accountStatus', [username_input.value, password_input.value]);
    });

    autoClose_checkbox.addEventListener('change', e => {
        if (e.target.checked) {
            chrome.storage.sync.set({ autoClose: true });
        } else {
            chrome.storage.sync.set({ autoClose: false });
        }
        status.textContent =
            chrome.i18n.getMessage('optionsSaved', e.target.checked ?
                chrome.i18n.getMessage('on') :
                chrome.i18n.getMessage('off')
            );
    });
}

handleUserInput();