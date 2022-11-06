customElements.define('tab-bar', class TabBar extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(TabBarTemplate.content.cloneNode(true));
    }
    connectedCallback() {
        this._shadow.querySelector("main").onclick = (event) => {
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

const TabBarTemplate = document.createElement('template');
TabBarTemplate.innerHTML = `
    <style>
        main {
            display:flex;
            flex-direction:row;
            flex-wrap: nowrap;
        }
        ::slotted(app-tab) {
            flex-grow:1;
            border-bottom: 2px solid transparent;
            font-size: smaller;
        }
        ::slotted(app-tab:hover) {
            background-color:var(--hover-color, rgba(0, 0, 0, 5%));
        }
        ::slotted(app-tab[selected]) {
            border-bottom-color: var(--primary-color, #000);
            font-weight: bold;
            color: var(--primary-color, #000);
        }
    </style>
    <main><slot></slot></main>
`;