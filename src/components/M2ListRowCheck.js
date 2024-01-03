import template from "./templates/M2ListRowCheck.html"

class M2ListRowCheck extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        shadow.querySelector('main').onclick = this.onclick;
        this._checkbox = shadow.querySelector('input[type=checkbox]');
    }

    static get observedAttributes() { return ['selected']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ('selected' === name) {
            this._checkbox.checked = (newValue !== null);
        }
    }

    onclick = (event) => {
        if (this.getAttribute('selected') !== null) {
            this.removeAttribute('selected');
        } else {
            this.setAttribute('selected', '');
        }
    }
};

customElements.define('m2-list-row-check', M2ListRowCheck);

