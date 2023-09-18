(function () {

    class RoundButton extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' })
            this._shadow.appendChild(template.content.cloneNode(true));
        }

        static get observedAttributes() { return ["data-icon", "disabled"]; }

        attributeChangedCallback(name, oldValue, newValue) {
            const elm = this._shadow.querySelector("main");
            if ("data-icon" === name) {
                elm.innerText = newValue;
            } else if ("disabled" === name) {
                if (null === newValue) {
                    elm.removeAttribute("disabled");
                } else {
                    elm.setAttribute("disabled", "");
                }
            }
        }

        connectedCallback() {
            this._shadow.addEventListener('click', this._onClick);
        }
        disconnectedCallback() {
            this._shadow.removeEventListener('click', this._onClick);
        }

        _onClick(event) {
            if (event.target.hasAttribute("disabled")) {
                event.stopPropagation();
            }
        }
    }

    const template = document.createElement('template');
    template.innerHTML = `
        <link href="./assets/material.css" rel="stylesheet"/>
        <style>
            main {
                padding:8px;
                text-align:center;
                border:0 none;
                color: inherit;
                background-color:transparent;
                border-radius: 50%;
                user-select: none;
            }
            main:not([disabled]):hover {
                background-color:var(--hover-color, rgb(0 0 0 /5%));
                cursor:pointer;
            }
            main[disabled] {
                color:var(--text-color-disabled);
            }
        </style>
        <main class="material-symbols"/>
    `;

    window.customElements.define('round-button', RoundButton);
})();