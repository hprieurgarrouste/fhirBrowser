import template from "./templates/fhirReferences.html";

import "./components/ListItem.js";
import "./components/ListRow.js";
import "./components/RoundButton.js";
import { FhirService } from "./services/Fhir.js";

class FhirReferences extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resourceType = null;
        this._resourceId = null;
    }

    connectedCallback() {
        this._shadow.getElementById('list').addEventListener("click", (event) => {
            const item = event.target.closest("list-row");
            if (item) {
                location.hash = `#${item.dataset.id}?${this._resourceType.type.toLowerCase()}=${this._resourceId}`;
            } else {
                event.preventDefault();
                event.stopPropagation();
            }
        });
        this._shadow.querySelector('side-panel').onClose = ((event) => {
            this.classList.add('hidden');
            event.preventDefault();
            event.stopPropagation();
        }).bind(this);
    }

    clear() {
        const list = this._shadow.getElementById('list');
        while (list.firstChild) list.removeChild(list.lastChild);
    }

    load(resourceType, resourceId) {
        this._resourceType = resourceType;
        this._resourceId = resourceId;
        this.clear();
        const list = this._shadow.getElementById('list');
        const references = FhirService.references(resourceType);
        if (references.length) {
            references.sort((r1, r2) => r1.localeCompare(r2)).forEach(ref => {
                const row = document.createElement('list-row');
                row.setAttribute("data-id", ref);
                const item = document.createElement('list-item');
                item.setAttribute("data-icon", FhirService.ResourceIcon(ref));
                item.setAttribute("data-primary", ref);
                row.appendChild(item);
                list.appendChild(row);
            });
            return true;
        }
        return false;
    }

};

customElements.define('fhir-references', FhirReferences)
