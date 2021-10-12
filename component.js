export default class Component {
    
    constructor(/** @type {string} */ selectorOfTemplate) {
        if (this.constructor === Component) throw new Error('cannot instantiate abstract class Component.');

        const template = document.querySelector(selectorOfTemplate);
        if (!(template instanceof HTMLTemplateElement)) throw new TypeError(`expect <template>, got ${template}.`);
        
        /** @type {HTMLTemplateElement} */ this.template = template;
        /** @type {HTMLElement | null} */ this.instance = null;
    }

    /**
     * initialize the component
     */
    async init() {}

    /**
     * append content to dest asynchronously.
     * @param {Element} dest destination
     * @param {string} selectorOfInstance
     */
    async render(dest, selectorOfInstance) {
        await this.init();
        // transfering the template content rather than
        // copying it to preserve eventlisteners.
        dest.append(document.adoptNode(this.template.content));
        this.instance = dest.querySelector(selectorOfInstance);
    }

    /**
     * visually show self asynchronously.
     */
    async show() { if (this.instance) this.instance.hidden = false; }

    /**
     * visually hide self asynchronously.
     */
    async hide() { if (this.instance) this.instance.hidden = true; }

}