import template from "./templates/ResourceReferences.html";

import "./components/ListItem"
import "./components/ListRow"

import { FhirService } from "./services/Fhir"

class ResourceReferences extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resourceType = null;
        this._resourceId = null;
        this._list = null;
    }

    connectedCallback() {
        this._list = this._shadow.querySelector('app-list');
        this._list.onclick = this.appListClick;
        this._list.onFilter = this.appListFilter;

        this._shadow.querySelector('side-panel').onClose = this.sidePanelClose;

    }

    appListClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = event.target.closest("list-row");
        if (item) {
            location.hash = `#${item.dataset.target}?${item.dataset.search}=${this._resourceId}`;
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
        this._resourceType = resourceType;
        this._resourceId = resourceId;

        this._list.clear();

        const references = FhirService.references(resourceType.type);
        if (references) {
            Object.entries(references).forEach(([key, value]) => {
                value.forEach(v => {
                    const row = document.createElement('list-row');
                    row.setAttribute("data-target", key);
                    row.setAttribute("data-search", v.name);
                    const item = document.createElement('list-item');
                    item.setAttribute("data-icon", FhirService.ResourceIcon(key));
                    item.setAttribute("data-primary", `${key}.${v.name}`);
                    item.setAttribute("data-secondary", v.documentation.length > 100 ? `${v.documentation.substring(0, 100)}...` : v.documentation);
                    row.appendChild(item);
                    this._list.appendChild(row);
                })
            });
        }
        return this._list.children.length > 0;
    }

};

customElements.define('resource-references', ResourceReferences)
