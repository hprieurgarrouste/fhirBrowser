import template from "./templates/ServerCapabilities.html";

import "./components/AppList"
import "./components/ListItem"
import "./components/ListRow"

import { FhirService } from "./services/Fhir"

class ServerCapabilities extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this._list = shadow.querySelector('app-list');
    }

    connectedCallback() {
        FhirService.addListener(this.serverChanged);
    }

    serverChanged = () => {
        const make = (name, value) => {
            if (typeof value === 'undefined') return;

            const item = document.createElement('list-item');
            item.setAttribute('data-primary', name);
            const row = document.createElement('list-row');
            item.setAttribute('data-secondary', value);
            row.appendChild(item);
            this._list.appendChild(row);
        }

        this._list.clear();

        const capabilityStatement = FhirService.server?.capabilities;

        make('copyright', capabilityStatement.copyright);
        make('description', capabilityStatement.description);
        make('fhirVersion', `${capabilityStatement.fhirVersion} (${FhirService.release})`);

        const ul = document.createElement('UL');
        capabilityStatement.format.forEach((f) => {
            const li = document.createElement('LI');
            li.innerText = f;
            ul.appendChild(li);
        });
        make('format', ul.outerHTML);

        if (capabilityStatement.implementation) {
            make('implementation description', capabilityStatement.implementation.description);
            make('implementation name', capabilityStatement.implementation.name);
            make('implementation url', capabilityStatement.implementation.url);
        }
        make('language', capabilityStatement.language);
        make('name', capabilityStatement.name);
        make('publisher', capabilityStatement.publisher);
        if (capabilityStatement.software) {
            make('software name', capabilityStatement.software.name);
            make('software version', capabilityStatement.software.version);
            make('software release date', capabilityStatement.software.releaseDate);
        }
    }

};
customElements.define('server-capabilities', ServerCapabilities);
