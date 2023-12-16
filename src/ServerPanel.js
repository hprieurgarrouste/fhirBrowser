import template from "./templates/ServerPanel.html";

import "./components/AppTabs"

import "./ServerResources"
import "./ServerCapabilities"

import { FhirService } from "./services/Fhir";

class ServerPanel extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }

    connectedCallback() {
        FhirService.addListener(this.serverChanged);
    }

    serverChanged = () => {
        const server = FhirService.server;
        this._shadow.getElementById("serverTitle").setAttribute("data-primary", server.serverCode);
        this._shadow.getElementById("serverTitle").setAttribute("data-secondary", server.capabilities?.implementation?.description || server.capabilities?.software?.name || server.url);
    }
};
customElements.define('server-panel', ServerPanel);
