(function () {

    class ListItem extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
        }

        static get observedAttributes() { return ["data-primary", "data-secondary", "data-icon"]; }

        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case "data-icon":
                    this._shadow.getElementById("icon").innerText = newValue;
                    break;
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
        <link href="./assets/material.css" rel="stylesheet"/>
        <style>
            main {
                background-color: inherit;
                display: flex;
                align-items: center;
            }
            #primary {
                display: block;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                text-transform: capitalize;
                color: var(--text-color-normal, black);
            }
            #secondary {
                display: block;
                font-size: smaller;
                color: var(--text-color-disabled);
                overflow-wrap: break-word;
            }
            #icon {
                align-self: center;
                margin-right: 0.5em;
            }
        </style>
        <main>
            <span id="icon" class="material-symbols"></span>
            <span class="text">
                <span id="primary"></span>
                <span id="secondary"></span>
            </span>
        </main>
    `;

    window.customElements.define('list-item', ListItem);
})();
