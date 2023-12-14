import template from "./templates/fhirMetadata.html";

import "./components/AppTabs"

import "./FhirResourceTypes"
import "./FhirCapability"
import { FhirService } from "./services/Fhir";

class FhirMetadata extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._metadata = null;
    }

    connectedCallback() {
        window.addEventListener("hashchange", this.locationHandler);
        FhirService.addListener(this.serverChanged);
    }

    locationHandler = () => {
        let hash = window.location.hash.replace('#', '').trim();
        if (hash.length) {
            let resourceType = '';
            if (hash.indexOf('?') > 0) {
                resourceType = hash.split('?')[0];
            } else {
                resourceType = hash.split("/")[0];
            }
            this._shadow.getElementById("resourceTypes").value = resourceType;
        } else {
            this._shadow.getElementById("resourceTypes").value = null;
        }
    }

    serverChanged = () => {
        const server = FhirService.server;
        this._shadow.getElementById("serverTitle").setAttribute("data-primary", server.serverCode);
        this._shadow.getElementById("serverTitle").setAttribute("data-secondary", server.capabilities?.implementation?.description || server.capabilities?.software?.name || server.url);

        this._shadow.getElementById("resourceTypes").metadata = server.capabilities;
        this._shadow.getElementById("capability").metadata = server.capabilities;
        this.locationHandler();
    }

};
customElements.define('fhir-metadata', FhirMetadata)
