import Component from './component.js';
import Swapper from './swapper.js';
import { getValue } from './util.js';

const debounce = (f, timeout) => {
    let id;
    return () => {
        clearTimeout(id);
        id = setTimeout(f, timeout);
    };
};

class Settings extends Component {

    constructor(/** @type {string} */ selectorOfTemplate) {
        super(selectorOfTemplate);
    }

    /**
     * append content to dest asynchronously.
     * @param {HTMLElement} dest destination
     */
     async render(dest) {
        await super.render(dest);
        this.instance = dest.querySelector('form');
    }

    async init() {
        const form = this.template.content.querySelector('form');

        // set section title
        const /** @type {HTMLLegendElement[]} */ legends = form.querySelectorAll('legend');
        legends.forEach(legend => 
            legend.textContent =
                legend.dataset.message ?
                chrome.i18n.getMessage(legend.dataset.message) :
                ''
        );
        
        // set controls string
        const /** @type {HTMLLabelElement[]} */ labels = form.querySelectorAll('label');
        labels.forEach(label => {
            const span = document.createElement('span');
            span.classList.add('note');
            span.textContent = label.dataset.message ?
                chrome.i18n.getMessage(label.dataset.message) :
                '';
            label.append(span);
        });

        const /** @type {HTMLButtonElement[]} */ buttons = form.querySelectorAll('button');
        buttons.forEach(button => button.textContent =
            button.dataset.message ? chrome.i18n.getMessage(button.dataset.message) : '');

        const /** @type {HTMLInputElement[]} */ inputs = Array.from(form.querySelectorAll('input'));

        // set controls value
        const setValueAsync = getValue(inputs.map(input => input.name))
            .then(object =>
                Object.entries(object)
                    .forEach(([k, v]) => {
                        const /** @type {HTMLInputElement} */ control = form[k];
                        if (typeof v === 'string') {
                            control.value = v;
                        } else if (typeof v === 'boolean') {
                            control.checked = v;
                        } else {
                            console.warn(`unable to set ${k}: ${v}`);
                        }
                    })
            );
        
        const status = document.querySelector('#status');
        const hide = debounce(() => status.classList.add('hide'), 1000);
        const showStatus = () => {
            status.classList.remove('hide');
            hide();
        };

        form.addEventListener('submit', e => {
            e.preventDefault();

            const /** @type {HTMLInputElement} */ usernameInput = form.username;
            const /** @type {HTMLInputElement} */ passwordInput = form.password;

            chrome.storage.sync.set({
                [usernameInput.name]: usernameInput.value,
                [passwordInput.name]: passwordInput.value
            });

            console.log(`Username and password are set to ${usernameInput.value} and ${passwordInput.value}.`)

            status.textContent =
                chrome.i18n.getMessage('accountStatus', [usernameInput.value, passwordInput.value]);
            showStatus();
        });

        const checkboxAction = {
            autoClose: e => {
                if (e.target.checked) {
                    chrome.storage.sync.set({ autoClose: true });
                } else {
                    chrome.storage.sync.set({ autoClose: false });
                }
                status.textContent =
                    chrome.i18n.getMessage('autoCloseTab',
                        e.target.checked ?
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
                    chrome.i18n.getMessage('showPassword',
                        e.target.checked ?
                        chrome.i18n.getMessage('on') :
                        chrome.i18n.getMessage('off')
                    );
            }
        };
        const optionSection = form.querySelector('fieldset[name=options]');
        optionSection.addEventListener('change', (/** @type {Event & { target: HTMLElement }} */ e) => {
            if (e.target.tagName === 'INPUT') {
                e.preventDefault();
                
                checkboxAction[e.target.id](e);
                showStatus();
            }
        });

        return setValueAsync;
    }
}

class About extends Component {

    async init() {
        // set strings
        const items = this.template.content.querySelectorAll('[data-message]');
        
        items.forEach(item => item.textContent = chrome.i18n.getMessage(item.dataset.message));
    }

    /**
     * append content to dest asynchronously.
     * @param {HTMLElement} dest destination
     */
     async render(dest) {
        await super.render(dest);
        this.instance = dest.querySelector('.container');
    }

}

function main() {
    const wrapper = document.querySelector('.wrapper');

    const pageTitle = document.querySelector('.page-title');

    const settings = new Settings('#settings-template');
    const about = new About('#about-template');

    const actions = {
        settings: () => {
            pageTitle.textContent = chrome.i18n.getMessage('settings');
            settings.show();
            about.hide();
        },
        about: () => {
            pageTitle.textContent = chrome.i18n.getMessage('about');
            about.show();
            settings.hide();
        },
        notImplemented: type => console.error(`actions.${type} is not implemented.`)
    };
    
    Promise.all([
        settings.render(wrapper),
        about.render(wrapper)
    ])
    .then(actions.settings)
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
}

main();
