customElements.define('round-button', class RoundButton extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.appendChild(RoundButtonTemplate.content.cloneNode(true));
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
        this._shadow.querySelector('main').addEventListener('click', (event) => {
            if (event.target.hasAttribute("disabled")) {
                event.stopPropagation();
            }
        });
    }
});

const RoundButtonTemplate = document.createElement('template');
RoundButtonTemplate.innerHTML = `
    <link href="./assets/material.css" rel="stylesheet"/>
    <style>
        main {
            padding:8px;
            cursor:pointer;
            text-align:center;
            border:0 none;
            color: inherit;
            background-color:transparent;
            border-radius: 50%;
            user-select: none;
        }
        main:not([disabled]):hover {
            background-color:var(--hover-color, rgb(0 0 0 /5%));
        }
        main[disabled] {
            color:var(--text-color-disabled);
            cursor: default;
        }
    </style>
    <main class="material-icons"/>
`;