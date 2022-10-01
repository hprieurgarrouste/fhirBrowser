customElements.define('app-tabs', class AppTabs extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppTabsTemplate.content.cloneNode(true));
    }
    connectedCallback() {
        const template = this._shadow.getElementById('template').content;
        this._shadow.appendChild(template.cloneNode(true));
        this._shadow.getElementById('wrapper').onclick = (event) => {
            if (event.target.nodeName === 'APP-TAB') {
                this.select(event.target.id);
                event.stopPropagation();
            }
        };
    }

    select(id) {
        const tab = this._shadow.querySelector('slot').assignedElements().filter(tab => tab.id === id)[0];
        if (tab) {
            this._shadow.querySelector('slot').assignedElements().forEach(t => t.removeAttribute('selected'));
            tab.setAttribute("selected", "selected");
            this.dispatchEvent(new CustomEvent("click", {
                bubbles: false,
                cancelable: false,
                'detail': {
                    tabId: id
                }
            }));

        }
    }
});

const AppTabsTemplate = document.createElement('template');
AppTabsTemplate.innerHTML = `
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