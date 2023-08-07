(function () {

    class Chips extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' })
            this._shadow.appendChild(template.content.cloneNode(true));
        }
    }

    const template = document.createElement('template');
    template.innerHTML = `
        <link href="./assets/material.css" rel="stylesheet"/>
        <style>
            main {
                padding: 0 0.5em;
                border-radius: 1em;
                white-space: nowrap;
                border: 1px solid var(--border-color);
                color: var(--text-color-normal);
                cursor: pointer;
                text-decoration: none;
                text-align: center;
                font-size: smaller;
            }
            main:hover {
                background-color: var(--hover-color);
            }
        </style>
        <main><slot/></main>
    `;

    window.customElements.define('app-chips', Chips);
})();