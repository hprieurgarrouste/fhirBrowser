import template from "./templates/AppConfirm.html"

class AppConfirm extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        shadow.querySelector('main').onclick = this.onClose;
        shadow.querySelector('.surface').onclick = (event) => event.stopPropagation();

        this._title = shadow.querySelector('h2');

        this._btnOk = shadow.getElementById('btnOk');
        this._btnOk.onclick = this.validateClick;

        shadow.getElementById('btnCancel').onclick = this.onClose;
    }

    onClose = (event) => {
        this.hidden = true;
    }

    validateClick = (event) => {
        this.onValidate(event);
        this.hidden = true;
    }
    _onValidate = (event) => { }
    get onValidate() {
        return this._onValidate;
    }
    set onValidate(validateFct) {
        this._onValidate = validateFct;
    }

    static get observedAttributes() { return ['data-title', 'data-ok-text']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ('data-title' === name) {
            this._title.innerText = newValue;
        } else if ('data-ok-text' === name) {
            this._btnOk.setAttribute('value', newValue);
        }
    }
};
window.customElements.define('app-confirm', AppConfirm);
