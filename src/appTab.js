customElements.define('app-tab', class AppTab extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppTabTemplate.content.cloneNode(true));
    }
    connectedCallback() {
        this._shadow.querySelector("main").innerHTML = this.innerHTML;
    }
});

const AppTabTemplate = document.createElement('template');
AppTabTemplate.innerHTML = `
    <style>
        main {
            background-color: transparent;
            color: inherit;
            cursor: pointer;
            font: inherit;
            height: 3em;
            line-height: 3em;
            text-transform: uppercase;
            text-align: center;
            white-space: nowrap;
            width:100%;
        }
    </style>
    <main></main>
`;
