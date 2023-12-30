import template from "./templates/ListItem.html";

class ListItem extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this._icon = shadow.getElementById("icon");
        this._primary = shadow.getElementById("primary");
        this._secondary = shadow.getElementById("secondary");
    }

    static get observedAttributes() { return ["data-primary", "data-secondary", "data-icon"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "data-icon":
                this._icon.innerText = newValue;
                break;
            case "data-primary":
                this._primary.innerHTML = newValue;
                break;
            case "data-secondary":
                this._secondary.innerHTML = newValue;
                break;
            default:
                break;
        }
    }
};

customElements.define('list-item', ListItem)

