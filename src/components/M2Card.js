import template from "./templates/M2Card.html"

export default class M2Card extends HTMLElement {
    /** @type {HTMLElement}*/
    #headerIcon;
    /** @type {HTMLSpanElement} */
    #headerPrimary;
    /** @type {HTMLSpanElement} */
    #headerSecondary;

    constructor(icon, primary, secondary) {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this.#headerIcon = shadow.querySelector('header>i');
        this.#headerPrimary = shadow.getElementById('primary');
        this.#headerSecondary = shadow.getElementById('secondary');
        if (icon) this.icon = icon;
        if (primary) this.primary = primary;
        if (secondary) this.secondary = secondary;
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

    get icon() {
        return this.getAttribute('data-icon');
    }
    /** @param {String} name */
    set icon(name) {
        this.setAttribute('data-icon', name);
    }

    get primary() {
        return this.getAttribute('data-primary');
    }
    /** @param {String} caption */
    set primary(caption) {
        this.setAttribute('data-primary', caption);
    }

    get secondary() {
        return this.getAttribute('data-secondary');
    }
    /** @param {String} caption */
    set secondary(caption) {
        this.setAttribute('data-secondary', caption);
    }
};

customElements.define('m2-card', M2Card)

