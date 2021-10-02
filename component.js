export default class Component {
    
    constructor(/** @type {string} */ selectorOfTemplate) {
        if (this.constructor === Component) throw new Error('cannot instantiate abstract class Component.');

        const template = document.querySelector(selectorOfTemplate);
        if (!(template instanceof HTMLTemplateElement)) throw new TypeError(`expect <template>, got ${template}.`);
        
        /** @type {HTMLTemplateElement} */ this.template = template;
        /** @type {HTMLElement} */ this.instance = null;
    }

    /**
     * append content to dest asynchronously.
     * @param {HTMLElement} dest destination
     */
    async render(dest) {
        await this.init();
        // transfering the template content rather than
        // copying it to preserve eventlisteners.
        dest.append(document.adoptNode(this.template.content, true));
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