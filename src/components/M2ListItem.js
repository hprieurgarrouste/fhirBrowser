import template from "./templates/M2ListItem.html"

export default class M2ListItem extends HTMLElement {
    /** @type {HTMLSpanElement} */
    #icon;
    /** @type {HTMLSpanElement} */
    #primary;
    /** @type {HTMLSpanElement} */
    #secondary;

    constructor(icon = '', primary = '', secondary = '') {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this.#icon = shadow.getElementById("icon");
        this.icon = icon;
        this.#primary = shadow.getElementById("primary");
        this.primary = primary;
        this.#secondary = shadow.getElementById("secondary");
        this.secondary = secondary;
    }

    static get observedAttributes() { return ["data-primary", "data-secondary", "data-icon"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "data-icon":
                this.#icon.innerText = newValue;
                break;
            case "data-primary":
                this.#primary.innerHTML = newValue;
                break;
            case "data-secondary":
                this.#secondary.innerHTML = newValue;
                break;
            default:
                break;
        }
    }

    get icon() {
        return this.#icon.innerText;
    }
    /** @param {String} name */
    set icon(name) {
        this.setAttribute('data-icon', name);
    }

    get primary() {
        return this.#primary.innerHTML;
    }
    /** @param {String} caption */
    set primary(caption) {
        this.setAttribute('data-primary', caption);
    }

    get secondary() {
        return this.#secondary.innerHTML;
    }
    /** @param {String} caption */
    set secondary(caption) {
        this.setAttribute('data-secondary', caption);
    }
};

customElements.define('m2-list-item', M2ListItem)

