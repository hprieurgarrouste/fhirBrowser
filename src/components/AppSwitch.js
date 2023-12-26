import template from "./templates/AppSwitch.html";

class AppSwitch extends HTMLElement {

    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.innerHTML = template;
        this._shadow.addEventListener('click', this.clickHandler);
        this._main = this._shadow.querySelector('main');
    }

    static get observedAttributes() { return ['data-checked']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ('data-checked' == name) {
            if (null === newValue) {
                this._main.classList.remove('checked');
            } else {
                this._main.classList.add('checked');
            }
        }
    }

    clickHandler = (event) => {
        if (this.hasAttribute('data-checked')) {
            this.removeAttribute('data-checked');
        } else {
            this.setAttribute('data-checked', '');
        }
    }
}
window.customElements.define('app-switch', AppSwitch);