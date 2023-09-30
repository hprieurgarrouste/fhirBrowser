(function () {
    class ServerAuth extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
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
        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link href="./assets/material.css" rel="stylesheet"/>
        <style>
            main {
                background-color:var(--hover-color, lightgray);
                border-bottom: 1px solid rgba(0,0,0,42%);
                display: flex;
                font-size: 1em;
                position:relative;
                margin-bottom: 1em;
            }
            main:focus-within {
                border-bottom-color: var(--primary-color, black);
            }
            input {
                background: none;
                border: 0 none;
                border-bottom: 1px solid transparent;
                caret-color: var(--primary-color, black);
                color: var(--text-color-normal, black);
                flex: auto;
                font: inherit;
                padding: 15px;
            }
            input:focus {
                outline: none;
                padding: 23px 15px 7px 15px;
                border-color: var(--primary-color);
            }
            input::placeholder {
                font-size: 1em;
                color:var(--text-color-disabled, black);
            }
            input::selection {
                color: white;
                background: var(--primary-color);
            }
            input:focus::placeholder {
                visibility: hidden;
            }
            input:not(:placeholder-shown) {
                padding: 23px 15px 7px 15px;
            }
            label {
                color: var(--text-color-disabled, black);
                font-size: 12px;
                left: 15px;
                pointer-events: none;
                position: absolute;
                top: 6px;
                visibility: hidden;
            }
            input:focus + label, input:not(:placeholder-shown) + label {
                visibility: visible;
            }
            input:focus + label {
                color: var(--primary-color, black);
            }
        </style>
        <main>
            <input type="text" placeholder="" list="List"></input>
            <label></label>
            <datalist id="List">
                <option value="No Auth"></option>
                <option value="API Key"></option>
                <option value="Basic"></option>
            </datalist>
        </main>
    `;

    customElements.define('server-auth', ServerAuth);
})();
