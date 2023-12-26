import template from "./templates/AppConfirm.html"

class AppConfirm extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._shadow.querySelector("main").onclick = this.onClose;
        this._shadow.querySelector('.surface').onclick = (event) => {
            event.stopPropagation();
        };
        this._shadow.getElementById('btnOk').onclick = this.validateClick;
        this._shadow.getElementById('btnCancel').onclick = this.onClose;
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

    static get observedAttributes() { return ["data-title", "data-ok-text"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ("data-title" === name) {
            this._shadow.querySelector("h2").innerText = newValue;
        } else if ("data-ok-text" === name) {
            this._shadow.getElementById('btnOk').setAttribute("value", newValue);
        }
    }
};
window.customElements.define('app-confirm', AppConfirm);
