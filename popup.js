'use strict';

class Component {
    
    constructor(/** @type {string} */ selectorOfTemplate) {
        if (this.constructor === Component) throw new Error('cannot instantiate abstract class Component.');

        const /** @type {HTMLTemplateElement} */ template = document.querySelector(selectorOfTemplate);
        if (template == null) throw new TypeError('could not found template');
        
        this.template = template;
        /** @type {HTMLElement} */ this.instance = null;
    }

    /**
     * initialize self asynchronously.
     */
    async init() { throw new Error('not implemented') }

    /**
     * append content to dest asynchronously.
     * @param {HTMLElement} dest destination
     */
    async render(dest) {
        await this.init();
        dest.append(document.importNode(this.template.content, true));
    }

    /**
     * visually show self asynchronously.
     */
    async show() { this.instance.hidden = false; }

    /**
     * visually hide self asynchronously.
     */
    async hide() { this.instance.hidden = true; }

}


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
        const setUsername = new Promise((resolve, reject) => {
            chrome.storage.sync.get(['username'], ({ username }) => {
                if (username == null) reject(new TypeError(`username is ${username}`));
                
                const usernameText = this.template.content.querySelector('.username');
                usernameText.textContent = `${chrome.i18n.getMessage('username')} ${username}`;
                resolve();
            });
        });
        const setPassword = new Promise((resolve) => {
            chrome.storage.sync.get(['showPasswordOnPopUp'], ({ showPasswordOnPopUp }) => {
                if (showPasswordOnPopUp) {
                    const passwordText = this.template.content.querySelector('.password');
                    chrome.storage.sync.get(['password'], ({ password }) => {
                        passwordText.textContent = `${chrome.i18n.getMessage('password')} ${password}`;
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        });

        return Promise.all([setUsername, setPassword]);
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
        const loginNoticeTitle = this.template.content.getElementById('notice-login-title');
        loginNoticeTitle.textContent = chrome.i18n.getMessage('loginNoticeTitle');

        const logoutNoticeTitle = this.template.content.getElementById('notice-logout-title');
        logoutNoticeTitle.textContent = chrome.i18n.getMessage('logoutNoticeTitle');

        return new Promise(resolve => {
            chrome.storage.sync.get(['loginPageNotice', 'logoutPageNotice'], ({
                loginPageNotice,
                logoutPageNotice
            }) => {
                const loginNoticeContent = this.template.content.getElementById('notice-login-content');
                const logoutNoticeContent = this.template.content.getElementById('notice-logout-content');

                // got the notice using textContent, so it's safe to use innerHTML here
                // we also want the <br> just as it is
                loginNoticeContent.innerHTML = 
                    loginPageNotice == '' ? 
                    chrome.i18n.getMessage('noNotice') :
                    loginPageNotice;
                logoutNoticeContent.innerHTML =
                    logoutPageNotice == '' ? 
                    chrome.i18n.getMessage('noNotice') :
                    logoutPageNotice;
                
                resolve();
            });
        });
    }

}

class Swapper {

    static eventType = 'swap';

    constructor(/** @type {HTMLUListElement} */ ulist) {
        this.list = ulist;

        this.list.addEventListener('click', e => {
            if (e.target instanceof HTMLAnchorElement && e.target.dataset.type) {
                this.list.querySelectorAll('a[data-type]')
                    .forEach(ele => ele.classList.remove('current'));
                e.target.classList.add('current');
                this.changeType(e.target.dataset.type);
            }
        });
    }

    changeType(/** @type {string} */ type) {
        const swapEvt = new CustomEvent(Swapper.eventType, { bubbles: true, detail: type });

        this.list.dispatchEvent(swapEvt);
    }

}

function main() {
    const /** @type {HTMLUListElement} */ types = document.querySelector('.types');
    const swapper = new Swapper(types);

    const wrapper = document.querySelector('.wrapper');

    const accountPanel = new AccountPanel('#account-panel');
    const noticePanel = new NoticePanel('#notice-panel');
    
    Promise.all([
        accountPanel.render(wrapper),
        noticePanel.render(wrapper)
    ])
    .then(() => {
        accountPanel.show();
        noticePanel.hide();
    })
    .catch(console.error);

    const container = document.querySelector('.container');
    container.addEventListener(Swapper.eventType, (/** @type {CustomEvent<string>} */ e) => {
        e.preventDefault();
        const type = e.detail;
        
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

