(function () {
    class FhirResourceTypesFilter extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
        }
        connectedCallback() {
            const text = this._shadow.getElementById("text");
            this._shadow.getElementById("clear").addEventListener('click', () => {
                if (text.value) {
                    text.value = '';
                    fireChange.call(this);
                }
            });
            this._shadow.querySelector("main").addEventListener('mousedown', (event) => {
                event.preventDefault();
                event.stopPropagation();
                text.focus();
            });
            text.addEventListener("input", fireChange.bind(this));
            function fireChange(event) {
                this.dispatchEvent(new CustomEvent("filterChanged", {
                    bubbles: false,
                    cancelable: false,
                    'detail': {
                        'text': text.value
                    }
                }));
            }
        }
        clear() {
            this._shadow.getElementById("clear").click();
        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link href="./assets/material.css" rel="stylesheet"/>
        <style>
            main {
                display: flex;
                padding: 0.7em;
                font-size: smaller;
            }
            main:focus-within {
                border-bottom-color: var(--primary-color, black);
            }
            #text {
                background: none;
                border: 0 none;
                color: var(--text-color-normal);
                flex: 1 1 auto;
                font-family: inherit;
                font-size: inherit;
            }
            #text:focus {
                outline: none;
            }
            #clear {
                cursor: pointer;
                font-size: inherit;
                line-height: unset;
            }
        </style>
        <main>
            <input id="text" type="text" placeholder="Type to filter"/>
            <i id="clear" class="material-symbols" title="clear">close</i>
        </main>
    `;

    window.customElements.define('fhir-resource-types-filter', FhirResourceTypesFilter);
})();