customElements.define('app-tabs', class AppTabs extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = `
            <style>
                #wrapper {
                    display:flex;
                    flex-direction:row;            
                    flex-wrap: nowrap;        
                }
                ::slotted(app-tab) {
                    flex-grow:1;
                    border-bottom: 2px solid transparent;
                }
                ::slotted(app-tab:hover) {
                    background-color:var(--hover-color, rgba(0, 0, 0, 5%));
                }
                ::slotted(app-tab[selected]) {
                    border-bottom-color: var(--primary-color, #000);
                }
                </style>
                <template id="template">
                <div id="wrapper"><slot></slot></div>
                </template>
                `;
    }
    connectedCallback() {
        const template = this._shadow.getElementById('template').content;
        this._shadow.appendChild(template.cloneNode(true));
        this._shadow.getElementById('wrapper').onclick = (event) => {
            if (event.target.nodeName === 'APP-TAB') {
                this._shadow.querySelector('slot').assignedElements().forEach(tab => tab.removeAttribute('selected'));
                event.target.setAttribute("selected", "selected");
                this.dispatchEvent(new CustomEvent("click", {
                    bubbles: false,
                    cancelable: false,
                    'detail': {
                        tabId: event.target.id
                    }
                }));
                event.stopPropagation();
            }
        };
    }
});

customElements.define('app-tab', class AppTab extends HTMLElement {
    connectedCallback() {
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = `
            <style>
                button {
                    height: 3em;
                    border: 0 none;
                    background-color: transparent;
                    font-size: inherit;
                    font-family: inherit;
                    text-transform: uppercase;
                    cursor: pointer;
                    white-space: nowrap;
                    width:100%;
                }
            </style>
            <button>${this.innerHTML}</button>
        `;
    }
});
