import template from "./templates/ResourceReferences.html"

import resourceIcon from "./fhirIconSet"

import "./components/ListItem"
import "./components/ListRow"

import { FhirService } from "./services/Fhir"

class ResourceReferences extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this._list = shadow.querySelector('app-list');
        this._list.onclick = this.appListClick;
        this._list.onFilter = this.appListFilter;

        shadow.getElementById('close').onclick = this.sidePanelClose;

        this._resourceId = null;
    }

    appListClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = event.target.closest("list-row");
        if (item) {
            location.hash = `#/${item.dataset.target}?${item.dataset.search}=${this._resourceId}`;
        }
    }

    appListFilter = (value) => {
        const filter = value.toLowerCase();
        this._list.childNodes.forEach(row => {
            row.hidden = !(row.dataset.target.toLowerCase().includes(filter) || row.dataset.search.toLowerCase().includes(filter));
        });
    }

    sidePanelClose = (event) => {
        this.hidden = true;
        event.preventDefault();
        event.stopPropagation();
    }

    load(resourceType, resourceId) {
        this._resourceId = resourceId;

        this._list.clear();

        const references = FhirService.server.references(resourceType.type);
        if (references) {
            Object.entries(references).forEach(([key, value]) => {
                value.forEach(v => {
                    const item = document.createElement('list-item');
                    item.setAttribute("data-icon", resourceIcon[key.toLowerCase()]);
                    item.setAttribute("data-primary", `${key}.${v.name}`);
                    item.setAttribute("data-secondary", v.documentation.length > 100 ? `${v.documentation.substring(0, 100)}...` : v.documentation);
                    const row = document.createElement('list-row');
                    row.setAttribute("data-target", key);
                    row.setAttribute("data-search", v.name);
                    row.appendChild(item);
                    this._list.appendChild(row);
                })
            });
        }
        return this._list.children.length > 0;
    }

};

customElements.define('resource-references', ResourceReferences)
