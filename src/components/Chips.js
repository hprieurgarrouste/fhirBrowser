(function () {

    class Chips extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' })
            this._shadow.appendChild(template.content.cloneNode(true));
        }

        static get observedAttributes() { return ["data-text", "data-icon"]; }

        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case "data-icon":
                    this._shadow.getElementById("icon").innerText = newValue;
                    break;
                case "data-text":
                    this._shadow.getElementById("text").innerText = newValue;
                    break;
                default:
                    break;
            }
        }
    }


    const template = document.createElement('template');
    template.innerHTML = `
        <link href="./assets/material.css" rel="stylesheet"/>
        <style>
            main {
                display: flex;
                align-items: center;
                gap: 0.5em;
                padding: 0.2em 0.5em;
                border-radius: 1em;
                white-space: nowrap;
                border: 1px solid var(--border-color);
                color: var(--text-color-normal);
                cursor: pointer;
                text-decoration: none;
                text-align: center;
            }
            main:hover {
                background-color: var(--hover-color);
            }
        </style>
        <main>
            <span id="icon" class="material-symbols"></span>
            <span id="text"></span>
        </main>
    `;

    window.customElements.define('app-chips', Chips);
})();