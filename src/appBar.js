customElements.define('app-bar', class AppBar extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppBarTemplate.content.cloneNode(true));
    }
    connectedCallback() {
        const template = this._shadow.getElementById('template').content;
        this._shadow.appendChild(template.cloneNode(true));
        this._shadow.getElementById('title').innerText = this.getAttribute('caption');
    }
    static get observedAttributes() {
        return ['caption'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'caption' && this.isConnected && this._shadow.getElementById('title')) {
            this._shadow.getElementById('title').innerText = newValue;
        }
    }
});

const AppBarTemplate = document.createElement('template');
AppBarTemplate.innerHTML = `
    <style>
        #wrapper {
            align-items: center;
            display: flex;
            flex-direction: row;
            padding: 0.5em;
        }
        #title {
            flex-grow: 1;
            margin:0;
            overflow: hidden;
            padding-left: 0.5em;
            text-overflow: ellipsis;
        }
    </style>
    <template id="template">
        <div id="wrapper">
            <slot name="left"></slot>
            <h3 id="title"></h3>
            <slot></slot>
        </h3>
    </template>
`;