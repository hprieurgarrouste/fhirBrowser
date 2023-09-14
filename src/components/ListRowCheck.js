(function () {

    class ListRowCheck extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));

            this._shadow.querySelector("input[type=number]").addEventListener("click", e => {
                e.preventDefault();
                e.stopPropagation();
                this.dispatchEvent(new CustomEvent("orderChanged", {
                    bubbles: true,
                    cancelable: false,
                    "detail": {
                        "newValue": e.target.value,
                        "oldValue": this.dataset.order,
                        "what": this.dataset.id
                    }
                }));
            });
        }

        static get observedAttributes() { return ["selected", "data-order"]; }

        attributeChangedCallback(name, oldValue, newValue) {
            if ("selected" === name) {
                this._shadow.querySelector("input[type=checkbox]").checked = (newValue !== null);
                this._shadow.querySelector("input[type=number]").disabled = !(newValue !== null);
            }
            if ("data-order" === name) {
                this._shadow.querySelector("input[type=number]").value = newValue;
            }

        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <style>
            main {
                padding: 0.5em 1em;
                background-color: inherit;
                display: flex;
                flex-direction: row;
                align-items: center;
            }
            main[selected], main:hover {
                background-color: var(--hover-color, rgba(0, 0, 0, 5%));
            }
            div {
                flex-grow: 1;
            }
            input[type="checkbox"] {
                margin-left: 1em;
            }

            input[type="number"]:disabled {
                visibility: hidden;
            }

            input[type="number"] {
                max-width: 1.6em;
                font-size: 1.2em;
                caret-color: var(--primary-color, black);
                background: none;
                border: 0 none;
                margin-left: 1em;
                color:var(--text-color-normal, black);
            }
            input[type="number"]:focus {
                outline: none;
            }

        </style>
        <main>
            <div><slot></slot></div>
            <input title="position" type="number" min="0" disabled></input>
            <input type="checkbox"></input>
        </main>
    `;

    window.customElements.define('list-row-check', ListRowCheck);
})();
