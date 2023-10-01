import template from "./templates/fhirResourceTypes.html";

import "./components/ListRow.js"
import "./components/ListItem.js"
import "./fhirResourceTypesFilter.js";
import { FhirService } from "./services/Fhir.js";
import { AsyncService } from "./services/Async.js";

class FhirResourceTypes extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._metadata = null;
        this._resourceType = null;
    }

    connectedCallback() {
        this._shadow.getElementById('filter').addEventListener("filterChanged", ({ detail }) => {
            const filter = detail.text.toLowerCase();
            const list = this._shadow.getElementById('list');
            list.childNodes.forEach(row => {
                row.hidden = !row.dataset.type.toLowerCase().startsWith(filter);
            });
        });

        const list = this._shadow.getElementById('list');
        list.addEventListener("click", ({ target }) => {
            const row = target.closest("list-row");
            if (row) {
                list.querySelector("[selected]")?.removeAttribute("selected");
                row.setAttribute("selected", "");
                this._resourceType = row.dataset.type;
                location.hash = `#${row.dataset.type}`;
            }
        });
    }

    clear() {
        this._shadow.getElementById('filter').clear();
        const list = this._shadow.getElementById('list');
        list.scrollTop = 0;
        while (list.firstChild) list.removeChild(list.lastChild);
    }

    get value() {
        return this._resourceType;
    }

    set value(resourceType) {
        if (resourceType != this._resourceType) {
            const list = this._shadow.getElementById('list');
            const rows = Array.from(list.childNodes).filter(r => r.dataset.type === resourceType);
            if (rows?.length) {
                this._resourceType = resourceType;
                this._shadow.querySelector("[selected]")?.removeAttribute("selected");
                rows[0].setAttribute("selected", "");
                rows[0].scrollIntoView();
            }
        }
    }

    set metadata(metadata) {
        this._metadata = metadata;
        this.clear();
        const list = this._shadow.getElementById('list');
        metadata.rest[0].resource.filter(res => res.interaction.map(interaction => interaction.code).includes('search-type')).forEach(resource => {
            const row = document.createElement('list-row');
            row.setAttribute("data-type", resource.type);
            const item = document.createElement('list-item');
            item.setAttribute("data-primary", resource.type);
            item.setAttribute("data-icon", FhirService.ResourceIcon(resource.type));
            row.appendChild(item);
            list.appendChild(row);
        });
    }

};

customElements.define('fhir-resource-types', FhirResourceTypes)
