customElements.define('tab-bar', class TabBar extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(TabBarTemplate.content.cloneNode(true));
    }
    connectedCallback() {
        const header = this._shadow.querySelector("header");
        let first = null;
        this._shadow.querySelector('slot').assignedElements().forEach((elm, index) => {
            if (elm.dataset.tab) {
                let tab = document.createElement('div');
                tab.className = 'tab';
                tab.innerText = elm.dataset.tab;
                tab.setAttribute("data-target", index);
                header.appendChild(tab);
                first = first || tab;
            } else {
                elm.hidden = true;
            }
        });
        if (first) this.select(first);

        header.onclick = ({ target }) => {
            this.select(target);
        };
    }

    select(tab) {
        const slot = this._shadow.querySelector("slot");
        const elm = slot.assignedElements()[tab.dataset.target];
        elm.scrollIntoView({ behavior: "smooth" });
        this._shadow.querySelector('header').childNodes.forEach(t => {
            if (t === tab) {
                t.setAttribute("selected", "selected");
            } else {
                t.removeAttribute('selected');
            }
        });
    };
});

const TabBarTemplate = document.createElement('template');
TabBarTemplate.innerHTML = `
    <style>
        #wrapper {
            display:flex;
            flex-direction:column;
            height:100%;
        }
        header {
            display:flex;
            flex: none;
            flex-direction:row;
            flex-wrap: nowrap;
            border-bottom: 1px solid var(--border-color);
        }
        slot {
            block-size: 100%;
            display: grid;
            flex: auto;
            grid-auto-flow: column;
            grid-auto-columns: 100%;
            grid-auto-rows: 100%;
            height: 0;
            overflow:hidden;
        }

        div.tab {
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

            flex-grow:1;
            border-bottom: 2px solid transparent;
            font-size: smaller;
        }
        div.tab:hover {
            background-color:var(--hover-color, rgba(0, 0, 0, 5%));
        }
        div.tab[selected] {
            border-bottom-color: var(--primary-color, #000);
            font-weight: bold;
            color: var(--primary-color, #000);
        }
    </style>
    <div id="wrapper">
        <header></header>
        <slot></slot>
    </div
`;