import template from "./templates/M2RoundButton.html"

export default class M2RoundButton extends HTMLElement {
    /** @type {HTMLButtonElement} */
    #main;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template;
        this.#main = shadow.querySelector("button");
    }

    static get observedAttributes() { return ["data-icon", "disabled"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ('data-icon' === name) {
            this.#main.innerText = newValue;
        } else if ('disabled' === name) {
            if (null === newValue) {
                this.#main.removeAttribute('disabled');
            } else {
                this.#main.setAttribute('disabled', '');
            }
        }
    }

    get icon() {
        return this.getAttribute('data-icon');
    }
    /** @param {String} name */
    set icon(name) {
        this.setAttribute('data-icon', name);
    }

}
customElements.define('m2-round-button', M2RoundButton);
