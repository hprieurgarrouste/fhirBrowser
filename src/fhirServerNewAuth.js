import template from "./components/templates/TextField.html";

class ServerAuth extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }

    static get observedAttributes() { return ["placeholder", "value"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        if ("placeholder" === name) {
            this._shadow.querySelector('input[type="text"]').setAttribute('placeholder', newValue);
            this._shadow.querySelector("label").innerText = newValue;
        } else if ("value" === name) {
            this._shadow.querySelector('input[type="text"]').value = newValue;
        }
    }

    connectedCallback() {
        this._text = this._shadow.querySelector('input[type="text"]');
        this._text.addEventListener('change', () => {
            this.dispatchEvent(new CustomEvent("change", {
                bubbles: false,
                cancelable: false,
                'detail': {
                    'value': this._text.value
                }
            }));

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
};
customElements.define('server-auth', ServerAuth);

