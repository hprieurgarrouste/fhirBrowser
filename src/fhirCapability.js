import template from "./templates/fhirCapability.html";

import "./components/AppList.js"
import "./components/ListItem.js"
import "./components/ListRow.js"
import { FhirService } from "./services/Fhir";

class FhirCapability extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }

    clear() {
        const wrapper = this._shadow.querySelector("main");
        while (wrapper.firstChild) wrapper.removeChild(wrapper.lastChild);
    }

    set metadata(metadata) {
        const list = this._shadow.querySelector('app-list');
        list.clear();

        make("copyright", metadata.copyright);
        make("description", metadata.description);
        make("fhirVersion", `${metadata.fhirVersion} (${FhirService.release})`);

        const ul = document.createElement('UL');
        metadata.format.forEach((f) => {
            const li = document.createElement('LI');
            li.innerText = f;
            ul.appendChild(li);
        });
        make("format", ul.outerHTML);

        if (metadata.implementation) {
            make("implementation description", metadata.implementation.description);
            make("implementation name", metadata.implementation.name);
            make("implementation url", metadata.implementation.url);
        }
        make("language", metadata.language);
        make("name", metadata.name);
        make("publisher", metadata.publisher);
        if (metadata.software) {
            make("software name", metadata.software.name);
            make("software version", metadata.software.version);
            make("software release date", metadata.software.releaseDate);
        }

        function make(name, value) {
            if (typeof value === "undefined") return;

            const row = document.createElement('list-row');
            const item = document.createElement('list-item');
            item.setAttribute("data-primary", name);
            item.setAttribute("data-secondary", value);
            row.appendChild(item);
            list.appendChild(row);
        }
    }

};
customElements.define('fhir-capability', FhirCapability);
