customElements.define('app-tab', class AppTab extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppTabTemplate.content.cloneNode(true));
    }
    connectedCallback() {
        this._shadow.getElementById('wrapper').innerHTML = this.innerHTML;
    }
});

const AppTabTemplate = document.createElement('template');
AppTabTemplate.innerHTML = `
    <style>
        button {
            background-color: transparent;
            border: 0 none;
            color: inherit;
            cursor: pointer;
            font: inherit;
            height: 3em;
            text-transform: uppercase;
            white-space: nowrap;
            width:100%;
        }
    </style>
    <button id="wrapper"></button>
`;
