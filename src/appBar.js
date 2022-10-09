customElements.define('app-bar', class AppBar extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppBarTemplate.content.cloneNode(true));
    }
});

const AppBarTemplate = document.createElement('template');
AppBarTemplate.innerHTML = `
    <style>
        main {
            align-items: center;
            display: flex;
            flex-direction: row;
            padding: 0.5em;
        }
        #barMiddle {
            flex-grow: 1;
            margin:0;
            overflow: hidden;
            padding-left: 0.5em;
            text-overflow: ellipsis;
        }
        #barRight {
            white-space: nowrap;
        }
    </style>
    <main>
        <div id="barLeft"><slot name="left"></slot></div>
        <div id="barMiddle"><slot name="middle"></slot></div>
        <div id="barRight"><slot name="right"></slot></div>
    </main>
`;