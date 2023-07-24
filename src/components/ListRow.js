(function () {

    class ListRow extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
        }

        static get observedAttributes() { return ["selected"]; }

        attributeChangedCallback(name, oldValue, newValue) {
            if ("selected" === name) {
                const elm = this._shadow.querySelector("main");
                if (null === newValue) {
                    elm.removeAttribute("selected");
                } else {
                    elm.setAttribute("selected", "");
                }
            }
        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <style>
            main {
                padding: 0.5em 1em;
                background-color: inherit;
            }
            main[selected], main:hover {
                background-color: var(--hover-color, rgba(0, 0, 0, 5%));
            }
        </style>
        <main>
            <slot></slot>
        </main>
    `;

    window.customElements.define('list-row', ListRow);
})();
