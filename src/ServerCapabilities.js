import template from "./templates/ServerCapabilities.html";

import "./components/M2List"
import "./components/M2ListItem"
import "./components/M2ListRow"

import context from "./services/Context"

class ServerCapabilities extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this._list = shadow.querySelector('m2-list');
    }

    /**
     * @param {object} capabilityStatement
     */
    load = (capabilityStatement) => {
        const make = (name, value) => {
            if (typeof value === 'undefined') return;

            const item = document.createElement('m2-list-item');
            item.setAttribute('data-primary', name);
            const row = document.createElement('m2-list-row');
            item.setAttribute('data-secondary', value);
            row.appendChild(item);
            this._list.appendChild(row);
        }

        this._list.clear();

        make('copyright', capabilityStatement.copyright);
        make('description', capabilityStatement.description);
        make('fhirVersion', `${capabilityStatement.fhirVersion} (${context.server.release})`);

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
