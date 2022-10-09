customElements.define('app-round-button', class AppRoundButton extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.appendChild(AppRoundButtonTemplate.content.cloneNode(true));
    }

    static get observedAttributes() { return ['app-icon']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "app-icon") {
            this._shadow.querySelector("main").innerText = newValue;
        }
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
        }
        main:hover {
            background-color:var(--hover-color, rgba(0,0,0,5%));
            border-radius: 50%;
        }
    </style>
    <main class="material-icons"/>
`;