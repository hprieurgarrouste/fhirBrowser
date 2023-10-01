import template from "./templates/fhirCapability.html";

import "./components/ListItem.js"

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
        this.clear();
        const wrapper = this._shadow.querySelector("main");

        make("copyright", metadata.copyright);
        make("description", metadata.description);
        make("fhirVersion", metadata.fhirVersion);
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
            wrapper.appendChild(row);
        }
    }

};
customElements.define('fhir-capability', FhirCapability);
