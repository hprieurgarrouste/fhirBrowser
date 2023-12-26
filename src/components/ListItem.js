import template from "./templates/ListItem.html";

class ListItem extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._icon = this._shadow.getElementById("icon");
        this._primary = this._shadow.getElementById("primary");
        this._secondary = this._shadow.getElementById("secondary");
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

