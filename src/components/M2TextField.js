import template from "./templates/M2TextField.html"

class M2TextField extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this._label = shadow.querySelector('label');
        this._labelInnerText = '';
        this._input = shadow.querySelector('input[type="text"]');
        this._helper = shadow.getElementById('helper');
    }

    static get observedAttributes() { return ['placeholder', 'readonly', 'required', 'value', 'helper']; }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'placeholder':
                this._labelInnerText = newValue;
                this._input.setAttribute('placeholder', newValue);
                this._label.innerText = newValue;
                break;
            case 'readonly':
            case 'required':
                if (newValue == null) {
                    this._input.removeAttribute(name);
                } else {
                    this._input.setAttribute(name, '');
                }
                break;
            case 'value':
                this._input.setAttribute('value', newValue);
                break;
            case 'helper':
                this._helper.innerText = newValue;
                break;
        }
        //css input:required::placeholder::after dont work :(
        if (this._input.hasAttribute('required')) {
            this._input.setAttribute('placeholder', `${this._labelInnerText}*`);
        }
    }

    checkValidity = function () {
        return this._input.checkValidity();
    }
    focus = function () {
        this._input.focus();
    }

    get value() {
        return this._input.value;
    }
    set value(newValue) {
        this._input.value = newValue;
    }
};
window.customElements.define('m2-textfield', M2TextField);

