import template from "./templates/M2Switch.html"

class M2Switch extends HTMLElement {

    /** @type {HTMLElement} */
    #main;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template;
        shadow.addEventListener('click', this.#clickHandler);
        this.#main = shadow.querySelector('main');
    }

    static get observedAttributes() { return ['data-checked']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ('data-checked' == name) {
            if (null === newValue) {
                this.#main.classList.remove('checked');
            } else {
                this.#main.classList.add('checked');
            }
        }
    }

    #clickHandler = (event) => {
        if (this.hasAttribute('data-checked')) {
            this.removeAttribute('data-checked');
        } else {
            this.setAttribute('data-checked', '');
        }
    }
}
window.customElements.define('m2-switch', M2Switch);