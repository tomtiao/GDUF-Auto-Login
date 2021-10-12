import Component from './component.js';
import Swapper from './swapper.js';
import { getValue } from './util.js';

class AccountPanel extends Component {

    constructor(/** @type {string} */ selectorOfTemplate) {
        super(selectorOfTemplate);
    }
    
    /**
     * append content to dest asynchronously.
     * @param {HTMLElement} dest destination
     */
    async render(dest) {
        await super.render(dest);
        this.instance = dest.querySelector('.info');
    }

    async init() {
        let { username, showPasswordOnPopUp: showPwd } = await getValue(['username', 'showPasswordOnPopUp']);

        if (username == null) throw new TypeError(`username is ${username}`);

        const usernameText = this.template.content.querySelector('.username');
        usernameText.textContent = `${chrome.i18n.getMessage('username')} ${username}`;
        
        if (showPwd) {
            const passwordText = this.template.content.querySelector('.password');

            let { password } = await getValue(['password']);
            passwordText.textContent = `${chrome.i18n.getMessage('password')} ${password}`;
        }
    }

}

class NoticePanel extends Component {

    constructor(/** @type {string} */ selectorOfTemplate) {
        super(selectorOfTemplate);
    }

    /**
     * append content to dest asynchronously.
     * @param {HTMLElement} dest destination
     */
    async render(dest) {
        await super.render(dest);
        this.instance = dest.querySelector('.notice');
    }

    async init() {
        // set notice title
        const titles = this.template.content.querySelectorAll('summary[data-message]');
        titles.forEach(title =>
            title.textContent = chrome.i18n.getMessage(title.dataset.message)
        );

        const contents = this.template.content.querySelectorAll('section[data-name]');

        let keyValue = await getValue(Array.from(contents).map(content => content.dataset.name));

        const wrapText = (span, s) => span.append(document.createTextNode(s),
                        document.createElement('br'));
        const setContent = (content, data) => {
            if (data[content.dataset.name]) {
                const span = document.createElement('span');
                
                data[content.dataset.name].split('\n').forEach((s) => wrapText(span, s));

                content.append(span);
            } else {
                content.textContent = chrome.i18n.getMessage('noNotice');
            }
        };
        // set notice content
        contents.forEach(content => setContent(content, keyValue));
    }

}

function main() {
    const wrapper = document.querySelector('.wrapper');

    const accountPanel = new AccountPanel('#account-panel');
    const noticePanel = new NoticePanel('#notice-panel');

    const actions = {
        account: () => {
            accountPanel.show();
            noticePanel.hide();  
        },
        notice: () => {
            noticePanel.show();
            accountPanel.hide();
        },
        notImplemented: type => console.error(`actions.${type} is not implemented.`)
    };
    
    Promise.all([
        accountPanel.render(wrapper),
        noticePanel.render(wrapper)
    ])
    .then(actions.account)
    .catch(console.error);

    new Swapper('.types');

    document.body.addEventListener(Swapper.EVENT_TYPE, (/** @type {CustomEvent<string>} */ e) => {
        e.preventDefault();

        const type = e.detail;
        if (type in actions) {
            actions[type]();
        } else {
            actions.notImplemented(type);
        }
    });

    const optionBtn = document.getElementById('optionBtn');
    optionBtn.textContent = chrome.i18n.getMessage('openSettings');

    optionBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
}

main();

