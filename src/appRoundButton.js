customElements.define('app-round-button', class AppRoundButton extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.appendChild(AppRoundButtonTemplate.content.cloneNode(true));
    }

    static get observedAttributes() { return ["app-icon", "disabled"]; }

    attributeChangedCallback(name, oldValue, newValue) {
        const elm = this._shadow.querySelector("main");
        if ("app-icon" === name) {
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

const AppRoundButtonTemplate = document.createElement('template');
AppRoundButtonTemplate.innerHTML = `
    <link href="./material.css" rel="stylesheet"/>
    <style>
        main {
            padding:8px;
            cursor:pointer;
            text-align:center;
            border:0 none;
            color: inherit;
            background-color:transparent;
            border-radius: 50%;
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