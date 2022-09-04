import "./appRoundButton.js"

customElements.define('app-dialog', class AppDialog extends HTMLElement {
    static TITLE_ATTRIBUTE = 'dialog-title';
    constructor() {
        super();
        this.closeEvent = new CustomEvent("close", {
            bubbles: false,
            cancelable: false,
        });
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = `
            <link rel="stylesheet" href="./material.css">
            <style>
                #mask {
                    position: absolute;
                    top: 0;
                    left:0;
                    background-color: rgba(0,0,0,50%);
                    min-height: 100%;
                    min-width: 100%;
                }
                #surface {
                    font-family: Roboto, Arial, monospace;
                    font-size: 1rem;
                    font-weight: 400;
                    line-height: 1.5;
                    color: var(--text-color-normal, rgba(0, 0, 0, .87));
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);         
                    height: 80%;
                    width: 80%;
                    border-radius: 4px;
                    background-color: var(--background-color, white);
                    box-shadow: 0px 11px 15px -7px rgb(0 0 0 / 20%), 0px 24px 38px 3px rgb(0 0 0 / 14%), 0px 9px 46px 8px rgb(0 0 0 / 12%);
                    display:flex;
                    flex-direction:column;
                }
                #header {
                    border-color:var(--border-color, rgba(0,0,0,.12));
                    border-bottom: 1px solid;
                    padding: 15px 24px;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                }
                #title {
                    font-size: 1.25rem;
                    line-height: 2rem;
                    margin:0;
                    flex: 1 1 auto;
                }
                #content {
                    flex: 1 1 auto;
                    height:0;
                    overflow: hidden;
                }
            </style>
            <template id="template">
                <div id="mask"></div>
                <div id="surface">
                    <div id="header">
                        <h2 id="title"></h2>
                        <app-round-button id="close" title="Close">close</app-round-button>
                    </div>
                    <div id="content">
                        <slot></slot>
                    </div>
                </div>
            </template>
        `;
    }
    connectedCallback() {
        const template = this._shadow.getElementById('template').content;
        this._shadow.appendChild(template.cloneNode(true));
        this._shadow.getElementById('mask').addEventListener("mousedown", () => {
            this.dispatchEvent(this.closeEvent)
        });
        this._shadow.getElementById('close').addEventListener("click", () => {
            this.dispatchEvent(this.closeEvent)
        });
        this._shadow.getElementById('title').innerText = this.getAttribute(AppDialog.TITLE_ATTRIBUTE);
    }
    static get observedAttributes() {
        return [AppDialog.TITLE_ATTRIBUTE];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === AppDialog.TITLE_ATTRIBUTE && this.isConnected) {
            this._title.innerText = newValue;
        }
    }
});
