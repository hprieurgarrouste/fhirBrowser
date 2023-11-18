import template from "./templates/fhirResourceTypes.html";

import "./components/List.js"
import "./components/ListRow.js"
import "./components/ListItem.js"
import { FhirService } from "./services/Fhir.js";

class FhirResourceTypes extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._metadata = null;
        this._resourceType = null;
    }

    connectedCallback() {
        const list = this._shadow.querySelector('app-list');
        list.onFilter = ((value) => {
            const filter = value.toLowerCase();
            list.childNodes.forEach(row => {
                row.hidden = !row.dataset.type.toLowerCase().includes(filter);
            });
        }).bind(this);

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

    get value() {
        return this._resourceType;
    }

    set value(resourceType) {
        const list = this._shadow.querySelector('app-list');
        if (resourceType) {
            if (resourceType != this._resourceType) {
                const rows = Array.from(list.childNodes).filter(r => r.dataset.type === resourceType);
                if (rows?.length) {
                    this._resourceType = resourceType;
                    list.querySelector("[selected]")?.removeAttribute("selected");
                    rows[0].setAttribute("selected", "");
                    rows[0].scrollIntoView();
                }
            }
        } else {
            list.querySelector("[selected]")?.removeAttribute("selected");
            list.scrollTop = 0;
        }
    }

    set metadata(metadata) {
        this._metadata = metadata;
        const list = this._shadow.querySelector('app-list');
        list.clear();
        metadata.rest[0].resource
            .filter(res => res.interaction.map(interaction => interaction.code).includes('search-type'))
            .forEach(resource => {
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
