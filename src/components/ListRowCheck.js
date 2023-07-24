(function () {

    class ListRowCheck extends HTMLElement {
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
                display: flex;
                flex-direction: row;
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
        </style>
        <main>
            <div><slot></slot></div>
            <input type="checkbox"></input>
        </main>
    `;

    window.customElements.define('list-row-check', ListRowCheck);
})();
