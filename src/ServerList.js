import template from "./templates/ServerList.html";

import M2List from "./components/M2List";
import M2ListItem from "./components/M2ListItem";
import M2ListRow from "./components/M2ListRow";

export default class ServerList extends HTMLElement {
    /** @type {M2List} */
    #list;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this.#list = shadow.querySelector('m2-list');
        this.#list.onclick = this.#appListClick;
    }

    /**
     * @param {PointerEvent} event
     */
    #appListClick = (event) => {
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
        this.#list.clear();
        Object.keys(values)
            .sort((k1, k2) => k1.localeCompare(k2))
            .forEach(key => {
                const item = new M2ListItem();
                item.setAttribute('data-primary', key);
                item.setAttribute('data-secondary', values[key].url);
                const row = new M2ListRow();
                row.setAttribute('data-id', key);
                row.appendChild(item);
                this.#list.appendChild(row);
            })
    }

    get value() {
        return this.#list.querySelector('m2-list-row[selected]')?.dataset.id;
    }

    set value(serverKey) {
        this.#list.querySelector('m2-list-row[selected]')?.removeAttribute('selected');
        const row = this.#list.querySelector(`m2-list-row[data-id="${serverKey}"]`);
        if (row) {
            row.setAttribute('selected', 'true');
            row.scrollIntoView();
        }
    }

};
customElements.define('server-list', ServerList);
