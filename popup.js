import Component from './component.js';
import Swapper from './swapper.js';
import { getValue } from './util.js';

class AccountPanel extends Component {

    constructor(/** @type {string} */ selectorOfTemplate) {
        super(selectorOfTemplate);
    }

    async init() {
        let { username, showPasswordOnPopUp: showPwd } = await getValue(['username', 'showPasswordOnPopUp']);

        if (!username) throw new TypeError('unable to find username.');

        const usernameText = this.template.content.querySelector('.username');
        if (!usernameText) throw new TypeError('unable to find usernameText.');
        
        usernameText.textContent = `${chrome.i18n.getMessage('username')} ${username}`;
        
        if (showPwd) {
            const passwordText = this.template.content.querySelector('.password');
            if (!passwordText) throw new TypeError('unable to find passwordText.');

            let { password } = await getValue(['password']);
            passwordText.textContent = `${chrome.i18n.getMessage('password')} ${password}`;
        }
    }

}

class NoticePanel extends Component {

    constructor(/** @type {string} */ selectorOfTemplate) {
        super(selectorOfTemplate);
    }

    async init() {
        // set notice title
        const /** @type {NodeListOf<HTMLElement & { dataset: { message: string }}>} */ titles = this.template.content.querySelectorAll('summary[data-message]');
        titles.forEach(title =>
            title.textContent = chrome.i18n.getMessage(title.dataset.message)
        );

        const /** @type {NodeListOf<HTMLElement & { dataset: { name: string }}>} */ contents = this.template.content.querySelectorAll('section[data-name]');

        const /** @type {Record<string, string>} */ keyValue = await getValue(Array.from(contents).map(content => content.dataset.name));

        const wrapText = (/** @type {HTMLSpanElement} */ span, /** @type {string} */ s) => span.append(document.createTextNode(s),
                        document.createElement('br'));
        const setContent = (/** @type {HTMLElement & { dataset: { name: string }}} */ content, /** @type {Record<string, string>} */ data) => {
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
    if (!wrapper) throw new TypeError('unable to find wrapper.');

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
        notImplemented: (/** @type {string} */ type) => console.error(`actions.${type} is not implemented.`)
    };
    
    Promise.all([
        accountPanel.render(wrapper, '.info'),
        noticePanel.render(wrapper, '.notice')
    ])
    .then(actions.account)
    .catch(console.error);

    const swapper = new Swapper('.types');

    swapper.onSwap((e) => {
        if (e instanceof CustomEvent) {
            e.preventDefault();
    
            const type = e.detail;
            if (type in actions) {
                // @ts-ignore
                actions[type]();
            } else {
                actions.notImplemented(type);
            }
        }
    });

    const optionBtn = document.getElementById('optionBtn');
    if (!optionBtn) throw new TypeError('unable to find optionBtn.');

    optionBtn.textContent = chrome.i18n.getMessage('openSettings');

    optionBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
}

main();
