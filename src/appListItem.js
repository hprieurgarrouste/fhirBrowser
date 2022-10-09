customElements.define('app-list-item', class AppListItem extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppListItemTemplate.content.cloneNode(true));
    }
});

const AppListItemTemplate = document.createElement('template');
AppListItemTemplate.innerHTML = `
    <style>
        main {
            padding: 0.5em 1em;
            background-color: inherit;
        }
        main:hover {
            background-color: var(--hover-color, rgba(0, 0, 0, 5%));
        }
        #title {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            text-transform: capitalize;
            color: var(--text-color-normal, black);
        }
        #subTitle {
            font-size: 0.875em;
            color: rgba(var(--text-color, "0, 0, 0"), 54%);
            overflow-wrap: break-word;
        }
    </style>
    <main>
        <div id="title"><slot name="title"></slot></div>
        <div id="subTitle"><slot name="subTitle"></slot></div>
    </main>
`;