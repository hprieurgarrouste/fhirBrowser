import "./appTitle.js";
import "./appRoundButton.js";

customElements.define('app-bar', class AppBar extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppBarTemplate.content.cloneNode(true));
    }
    connectedCallback() {
        this._shadow.getElementById("title").setAttribute('caption', this.getAttribute("title"));
        this._shadow.getElementById("navigation").addEventListener("click", (event) => {
            this.dispatchEvent(new CustomEvent("navigationClick", {
                bubbles: false,
                cancelable: false
            }));
            event.stopPropagation();
        });
    }
});

const AppBarTemplate = document.createElement('template');
AppBarTemplate.innerHTML = `
    <link href="./material.css" rel="stylesheet"/>
    <style>
        div {
            background-color: var(--primary-color, #000);
            color:#FFF;
        }
        i {
            margin-right: 1.3em;
            cursor: pointer;
        }
    </style>
    <div>
        <app-title id="title" caption="">
            <app-round-button slot="left" id="navigation" title="Menu">menu</app-round-button>
        </app-title>
    </div>
`;
