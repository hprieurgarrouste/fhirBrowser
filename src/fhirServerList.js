import template from "./templates/FhirServerList.html";

import "./components/AppList.js"
import "./components/ListRow.js"
import "./components/ListItem.js"

class FhirServerList extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }
    connectedCallback() {
        this._shadow.querySelector('app-list').onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            const row = event.target.closest("list-row");
            if (row) {
                this.value = row.dataset.id;
                this.dispatchEvent(new CustomEvent('serverchanged', {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        "serverCode": row.dataset.id
                    }
                }));
            }
        };
    }

    load(values) {
        const list = this._shadow.querySelector('app-list');
        list.clear();
        for (const key of Object.keys(values)
            .sort((k1, k2) => k1.localeCompare(k2))) {
            const row = document.createElement('list-row');
            row.setAttribute("data-id", key);
            const item = document.createElement('list-item');
            item.setAttribute("data-primary", key);
            item.setAttribute("data-secondary", values[key].url);
            row.appendChild(item);
            list.appendChild(row);
        }
    }

    get value() {
        return this._shadow.querySelector("list-row[selected]")?.dataset.id;
    }
    set value(serverKey) {
        this._shadow.querySelector("list-row[selected]")?.removeAttribute("selected");
        const row = this._shadow.querySelector(`list-row[data-id="${serverKey}"]`);
        if (row) {
            row.setAttribute("selected", "true");
            row.scrollIntoView();
        }
    }

};
customElements.define('fhir-server-list', FhirServerList);
