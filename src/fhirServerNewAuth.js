import template from "./components/templates/TextField.html";

class ServerAuth extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._text = null;
        this._label = '';
    }

    static get observedAttributes() { return ["placeholder", "value", "required"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        const text = this._shadow.querySelector('input[type="text"]');
        switch (name) {
            case "placeholder":
                this._label = newValue;
                text.setAttribute('placeholder', newValue);
                this._shadow.querySelector("label").innerText = newValue;
                break;
            case "required":
                if (newValue == null) {
                    text.removeAttribute('required');
                } else {
                    text.setAttribute('required', '');
                }
                break;
            case "value":
                text.value = newValue;
                break;

        }
        //css input:required::placeholder::after dont work :(
        if (text.hasAttribute('required')) {
            text.setAttribute('placeholder', `${this._label}*`);
        }
    }

    connectedCallback() {
        this._text = this._shadow.querySelector('input[type="text"]');
        this._text.addEventListener('change', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.textChange();
        });
        const datalist = document.createElement('datalist');
        datalist.setAttribute("id", "values");
        ['No Auth', 'API Key', "Basic", "OAuth 2"].forEach(method => {
            let option = document.createElement('option');
            option.value = method;
            datalist.appendChild(option);
        });
        this._shadow.appendChild(datalist);
        this._text.setAttribute("list", "values");
    }

    textChange = () => {
        this.dispatchEvent(new CustomEvent("change", {
            bubbles: false,
            cancelable: false,
            'detail': {
                'value': this._text.value
            }
        }));
    }
    checkValidity = function () {
        return this._shadow.querySelector('input[type="text"]').checkValidity();
    }

    focus = function () {
        this._shadow.querySelector('input[type="text"]').focus();
    }

    get value() {
        return this._text.value;
    }

    set value(newValue) {
        const oldValue = this._text.value;
        this._text.value = newValue;
        if (newValue !== oldValue) {
            this.textChange();
        }
    }
};
customElements.define('server-auth', ServerAuth);

