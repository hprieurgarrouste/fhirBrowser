(function () {

    class ListItem extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
        }

        static get observedAttributes() { return ["data-primary", "data-secondary"]; }

        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case "data-primary":
                    this._shadow.getElementById("primary").innerText = newValue;
                    break;
                case "data-secondary":
                    this._shadow.getElementById("secondary").innerText = newValue;
                    break;
                default:
                    break;
            }
        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <style>
            main {
                background-color: inherit;
            }
            #primary {
                display:block;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                text-transform: capitalize;
                color: var(--text-color-normal, black);
            }
            #secondary {
                font-size: smaller;
                color: var(--text-color-disabled);
                overflow-wrap: break-word;
            }
        </style>
        <main>
            <span id="primary"></span>
            <span id="secondary"></span>
        </main>
    `;

    window.customElements.define('list-item', ListItem);
})();
