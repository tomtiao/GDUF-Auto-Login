class Swapper {

    // static EVENT_TYPE = 'swap';

    constructor(/** @type {string} */ selectorOfList) {
        const list = document.querySelector(selectorOfList);
        if (!(list instanceof HTMLUListElement)) throw new TypeError(`expect <ul>, got ${list}`);
        
        /** @type {HTMLUListElement} */ this.list = list;

        this.list.querySelectorAll('a').forEach(link =>
            link.textContent =
                link.dataset.message ?
                chrome.i18n.getMessage(link.dataset.message) :
                '');

        this.list.addEventListener('click', e => {
            if (e.target instanceof HTMLAnchorElement && e.target.dataset.type) {
                e.preventDefault();

                this.list.querySelectorAll('a[data-type]')
                    .forEach(ele => ele.classList.remove('current'));
                e.target.classList.add('current');
                this.changeType(e.target.dataset.type);
            }
        });
    }

    changeType(/** @type {string} */ type) {
        const swapEvt = new CustomEvent(Swapper.EVENT_TYPE, { bubbles: true, detail: type });

        this.list.dispatchEvent(swapEvt);
    }

}

Swapper.EVENT_TYPE = 'swap';

export default Swapper;