import template from "./templates/TextField.html";

class TextField extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._label = '';
    }

    static get observedAttributes() { return ["placeholder", "readonly", "required", "value", "helper"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        const text = this._shadow.querySelector('input[type="text"]');
        switch (name) {
            case "placeholder":
                this._label = newValue;
                text.setAttribute('placeholder', newValue);
                this._shadow.querySelector("label").innerText = newValue;
                break;
            case "readonly":
                if (newValue == null) {
                    text.removeAttribute('readonly');
                } else {
                    text.setAttribute('readonly', '');
                }
                break;
            case "required":
                if (newValue == null) {
                    text.removeAttribute('required');
                } else {
                    text.setAttribute('required', '');
                }
                break;
            case "value":
                text.setAttribute('value', newValue);
                break;
            case "helper":
                this._shadow.getElementById('helper', newValue);
                break;
        }
        //css input:required::placeholder::after dont work :(
        if (text.hasAttribute('required')) {
            text.setAttribute('placeholder', `${this._label}*`);
        }
    }

    checkValidity = function () {
        return this._shadow.querySelector('input[type="text"]').checkValidity();
    }
    focus = function () {
        this._shadow.querySelector('input[type="text"]').focus();
    }

    get value() {
        const text = this._shadow.querySelector('input[type="text"]');
        return text.value;
    }
    set value(newValue) {
        const text = this._shadow.querySelector('input[type="text"]');
        text.value = newValue;
    }
};
window.customElements.define('text-field', TextField);

