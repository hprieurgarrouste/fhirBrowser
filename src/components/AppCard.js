import template from "./templates/AppCard.html";

class AppCard extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;

        this._main = this._shadow.querySelector('main');
        this._headerIcon = this._shadow.querySelector('header>i');
        this._headerPrimary = this._shadow.getElementById('primary');
        this._headerSecondary = this._shadow.getElementById('secondary');
        this._mediaSlot = this._shadow.querySelector('slot[name="media"');
        this._contentSlot = this._shadow.querySelector('slot:not([name])');
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

