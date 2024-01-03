import template from "./templates/ServerList.html";

import "./components/M2List"
import "./components/M2ListRow"
import "./components/M2ListItem"

class ServerList extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this._list = shadow.querySelector('m2-list');
        this._list.onclick = this.appListClick;
    }

    appListClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const row = event.target.closest('m2-list-row');
        if (row) {
            this.value = row.dataset.id;
            this.dispatchEvent(new CustomEvent('serverchanged', {
                bubbles: true,
                cancelable: true,
                detail: {
                    'serverCode': row.dataset.id
                }
            }));
        }
    }

    load(values) {
        this._list.clear();
        Object.keys(values)
            .sort((k1, k2) => k1.localeCompare(k2))
            .forEach(key => {
                const item = document.createElement('m2-list-item');
                item.setAttribute('data-primary', key);
                item.setAttribute('data-secondary', values[key].url);
                const row = document.createElement('m2-list-row');
                row.setAttribute('data-id', key);
                row.appendChild(item);
                this._list.appendChild(row);
            })
    }

    get value() {
        return this._list.querySelector('m2-list-row[selected]')?.dataset.id;
    }

    set value(serverKey) {
        this._list.querySelector('m2-list-row[selected]')?.removeAttribute('selected');
        const row = this._list.querySelector(`m2-list-row[data-id="${serverKey}"]`);
        if (row) {
            row.setAttribute('selected', 'true');
            row.scrollIntoView();
        }
    }

};
customElements.define('server-list', ServerList);
