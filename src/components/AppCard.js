import template from "./templates/AppCard.html";

class AppCard extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this._headerIcon = shadow.querySelector('header>i');
        this._headerPrimary = shadow.getElementById('primary');
        this._headerSecondary = shadow.getElementById('secondary');
    }

    static get observedAttributes() { return ["data-primary", "data-secondary", "data-icon"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "data-icon":
                this._headerIcon.innerText = newValue;
                break;
            case "data-primary":
                this._headerPrimary.innerText = newValue;
                break;
            case "data-secondary":
                this._headerSecondary.innerText = newValue;
                break;
            default:
                break;
        }
    }
};

customElements.define('app-card', AppCard)

