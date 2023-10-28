import template from "./templates/fhirReferences.html";

import "./components/Chips.js"
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
        const main = this._shadow.querySelector('main');
        main.addEventListener("click", ({ target }) => {
            const chip = target.closest("app-chips");
            if (chip) {
                location.hash = `#${chip.dataset.resource}?${this._resourceType.type.toLowerCase()}=${this._resourceId}`;
            }
        });
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
            references.forEach(ref => {
                let chip = document.createElement("app-chips");
                chip.setAttribute("data-icon", FhirService.ResourceIcon(ref));
                chip.setAttribute("data-text", ref);
                chip.setAttribute("data-resource", ref);
                list.appendChild(chip);
            });
            return true;
        }
        return false;
    }

};

customElements.define('fhir-references', FhirReferences)
