(function () {
    class AppBar extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
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
                font-size:1.17em;
                font-weight: bold;
            }
            #barRight {
                white-space: nowrap;
            }
        </style>
        <main>
            <section id="barLeft"><slot name="left"></slot></section>
            <section id="barMiddle"><slot name="middle"></slot></section>
            <section id="barRight"><slot name="right"></slot></section>
        </main>
    `;

    window.customElements.define('app-bar', AppBar);
})();