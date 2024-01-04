import template from "./templates/M2Card.html"

class M2Card extends HTMLElement {
    /** @type {HTMLElement}*/
    #headerIcon;
    /** @type {HTMLSpanElement} */
    #headerPrimary;
    /** @type {HTMLSpanElement} */
    #headerSecondary;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this.#headerIcon = shadow.querySelector('header>i');
        this.#headerPrimary = shadow.getElementById('primary');
        this.#headerSecondary = shadow.getElementById('secondary');
    }

    static get observedAttributes() { return ["data-primary", "data-secondary", "data-icon"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "data-icon":
                this.#headerIcon.innerText = newValue;
                break;
            case "data-primary":
                this.#headerPrimary.innerText = newValue;
                break;
            case "data-secondary":
                this.#headerSecondary.innerText = newValue;
                break;
            default:
                break;
        }
    }
};

customElements.define('m2-card', M2Card)

