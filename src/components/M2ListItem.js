import template from "./templates/M2ListItem.html"

class M2ListItem extends HTMLElement {
    /** @type {HTMLSpanElement} */
    #icon;
    /** @type {HTMLSpanElement} */
    #primary;
    /** @type {HTMLSpanElement} */
    #secondary;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this.#icon = shadow.getElementById("icon");
        this.#primary = shadow.getElementById("primary");
        this.#secondary = shadow.getElementById("secondary");
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
};

customElements.define('m2-list-item', M2ListItem)

