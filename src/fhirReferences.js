import template from "./templates/fhirReferences.html";

import "./components/Chips.js"
import { FhirService } from "./services/Fhir.js";

class FhirReferences extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resourceType = null;
    }

    connectedCallback() {
        const main = this._shadow.querySelector('main');
        main.addEventListener("click", ({ target }) => {
            const chip = target.closest("app-chips");
            if (chip) {
                this.dispatchEvent(new CustomEvent("referenceClick", {
                    bubbles: false,
                    cancelable: false,
                    'detail': {
                        'resourceType': chip.dataset.resource
                    }
                }));
            }
        });
    }

    clear() {
        const list = this._shadow.getElementById('list');
        while (list.firstChild) list.removeChild(list.lastChild);
    }

    load(references, resourceType, resourceId) {
        this.clear();
        const list = this._shadow.getElementById('list');
        references.forEach(ref => {
            let chip = document.createElement("app-chips");
            chip.setAttribute("data-icon", FhirService.ResourceIcon(ref));
            chip.setAttribute("data-text", ref);
            chip.setAttribute("data-resource", ref);
            list.appendChild(chip);
        });
    }

};

customElements.define('fhir-references', FhirReferences)
