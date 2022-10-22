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
        slot[name="title"] {
            display:block;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            text-transform: capitalize;
            color: var(--text-color-normal, black);
        }
        slot[name="subTitle"] {
            font-size: smaller;
            color: var(--text-color-disabled);
            overflow-wrap: break-word;
        }
    </style>
    <main>
        <slot name="title"></slot>
        <slot name="subTitle"></slot>
    </main>
`;