import template from "./templates/M2Dialog.html"

class M2Dialog extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        shadow.querySelector('main').addEventListener('click', (event) => this.onClose(event));

        this._surface = shadow.querySelector('.surface');
        this._surface.addEventListener('click', (event) => event.stopPropagation());

        this._title = shadow.getElementById('title');
    }

    connectedCallback() {
        window.addEventListener('hashchange', (event) => this.onClose(event));
    }

    _onClose = () => {
        this.hidden = true;
    }
    get onClose() {
        return this._onClose;
    }
    set onClose(closeFct) {
        this._onClose = closeFct;
    }

    static get observedAttributes() { return ['data-title', 'centered', 'fullscreen']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ('centered' == name) {
            this._surface.classList.add('centered');
        } else if ('fullscreen' == name) {
            this._surface.classList.add('fullscreen');
        } else if ('data-title' === name) {
            this._title.innerText = newValue;
        }
    }
};
window.customElements.define('m2-dialog', M2Dialog);
