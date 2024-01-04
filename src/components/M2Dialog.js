import template from "./templates/M2Dialog.html"

class M2Dialog extends HTMLElement {
    /** @type {HTMLDivElement} */
    #surface;
    /** @type {HTMLHeadingElement} */
    #title;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        shadow.querySelector('main').addEventListener('click', (event) => this.onClose(event));

        this.#surface = shadow.querySelector('.surface');
        this.#surface.addEventListener('click', (event) => event.stopPropagation());

        this.#title = shadow.getElementById('title');
    }

    connectedCallback() {
        window.addEventListener('hashchange', (event) => this.onClose(event));
    }

    #onClose = () => {
        this.hidden = true;
    }
    get onClose() {
        return this.#onClose;
    }
    set onClose(closeFct) {
        this.#onClose = closeFct;
    }

    static get observedAttributes() { return ['data-title', 'centered', 'fullscreen']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ('centered' == name) {
            this.#surface.classList.add('centered');
        } else if ('fullscreen' == name) {
            this.#surface.classList.add('fullscreen');
        } else if ('data-title' === name) {
            this.#title.innerText = newValue;
        }
    }
};
window.customElements.define('m2-dialog', M2Dialog);
