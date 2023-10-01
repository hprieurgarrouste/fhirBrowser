import template from "./templates/Chips.html";

class Chips extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.innerHTML = template;
    }

    static get observedAttributes() { return ["data-text", "data-icon"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "data-icon":
                this._shadow.getElementById("icon").innerText = newValue;
                break;
            case "data-text":
                this._shadow.getElementById("text").innerText = newValue;
                break;
            default:
                break;
        }
    }
}
window.customElements.define('app-chips', Chips);
