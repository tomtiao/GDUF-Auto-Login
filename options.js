import Component from './component.js';
import Swapper from './swapper.js';
import { getValue } from './util.js';

const debounce = (/** @type {TimerHandler} */ f, /** @type {number | undefined} */ timeout) => {
    /**
     * @type {number | undefined}
     */
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

    async init() {
        const form = this.template.content.querySelector('form');
        if (!form) throw new TypeError('unable to find form');

        // set section title
        const legends = form.querySelectorAll('legend');
        legends.forEach(legend => 
            legend.textContent =
                legend.dataset.message ?
                chrome.i18n.getMessage(legend.dataset.message) :
                ''
        );
        
        // set controls string
        const labels = form.querySelectorAll('label');
        labels.forEach(label => {
            const span = document.createElement('span');
            span.classList.add('note');
            span.textContent = label.dataset.message ?
                chrome.i18n.getMessage(label.dataset.message) :
                '';
            label.append(span);
        });

        const buttons = form.querySelectorAll('button');
        buttons.forEach(button => button.textContent =
            button.dataset.message ? chrome.i18n.getMessage(button.dataset.message) : '');

        const inputs = Array.from(form.querySelectorAll('input'));

        // set controls value
        const setValueAsync = getValue(inputs.map(input => input.name))
            .then((/** @type {Record<string, unknown>} */ object) =>
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
        if (!status) throw new TypeError('unable to find status');

        const hide = debounce(() => status.classList.add('hide'), 1000);
        const showStatusThenHide = () => {
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

            status.textContent =
                chrome.i18n.getMessage('accountStatus', [usernameInput.value, passwordInput.value]);
            showStatusThenHide();
        });

        const checkboxAction = {
            autoClose: (/** @type {Event & { target: HTMLInputElement }} */ e) => {
                const checked = e.target.checked;
                chrome.storage.sync.set({ autoClose: checked });

                status.textContent =
                    chrome.i18n.getMessage('autoCloseTab',
                        checked ?
                        chrome.i18n.getMessage('on') :
                        chrome.i18n.getMessage('off')
                    );
            },
            showPasswordOnPopUp: (/** @type {Event & { target: HTMLInputElement }} */ e) => {
                const checked = e.target.checked;
                chrome.storage.sync.set({ showPasswordOnPopUp: checked });

                status.textContent =
                    chrome.i18n.getMessage('showPassword',
                        checked ?
                        chrome.i18n.getMessage('on') :
                        chrome.i18n.getMessage('off')
                    );
            },
            backgroundAutoLogin: (/** @type {Event & { target: HTMLInputElement }} */ e) => {
                const checked = e.target.checked;
                chrome.storage.sync.set({ backgroundAutoLogin: checked });

                status.textContent =
                    chrome.i18n.getMessage('backgroundAutoLogin',
                        checked ?
                        chrome.i18n.getMessage('on') :
                        chrome.i18n.getMessage('off')
                    );
            },
            notImplemented: (/** @type {string} */ id) => console.error(`${id} is not implemented.`)
        };
        const optionSection = form.querySelector('fieldset[name=options]');
        if (!optionSection) throw new TypeError('unable to find optionSection');
    
        optionSection.addEventListener('change', (/** @type {Event} */ e) => {
            if (e.target instanceof HTMLInputElement) {
                e.preventDefault();
                
                // @ts-ignore
                if (e.target.id in checkboxAction) checkboxAction[e.target.id](e);
                else checkboxAction.notImplemented(e.target.id);
                
                showStatusThenHide();
            }
        });

        return setValueAsync;
    }
}

class About extends Component {

    async init() {
        // set strings
        const /** @type {NodeListOf<HTMLElement & { dataset: { message: string }}>} */ items =
            this.template.content.querySelectorAll('[data-message]');
        
        items.forEach(item => item.textContent = chrome.i18n.getMessage(item.dataset.message));
    }

}

function main() {
    const wrapper = document.querySelector('.wrapper');
    if (!wrapper) throw new TypeError('unable to find wrapper.');

    const pageTitle = document.querySelector('.page-title');
    if (!pageTitle) throw new TypeError('unable to find page-title.');

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
        notImplemented: (/** @type {string} */ type) => console.error(`actions.${type} is not implemented.`)
    };
    
    Promise.all([
        settings.render(wrapper, 'form'),
        about.render(wrapper, '.about')
    ])
    .then(actions.settings)
    .catch(console.error);

    const swapper = new Swapper('.types');

    swapper.onSwap((e) => {
        if (e instanceof CustomEvent) {
            e.preventDefault();
    
            const /** @type {string} */ type = e.detail;
            if (type in actions) {
                // @ts-ignore
                actions[type]();
            } else {
                actions.notImplemented(type);
            }
        }
    });
}

main();
