import template from "./templates/ServerPanel.html";

import "./components/AppTabs"
import "./components/ListItem"

import "./ServerResources"
import "./ServerCapabilities"

import { FhirService } from "./services/Fhir";

class ServerPanel extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this._title = shadow.getElementById('serverTitle');
    }

    connectedCallback() {
        FhirService.addListener(this.serverChanged);
    }

    serverChanged = () => {
        const server = FhirService.server;
        this._title.setAttribute('data-primary', server.serverCode);
        this._title.setAttribute('data-secondary', server.capabilities?.implementation?.description || server.capabilities?.software?.name || server.url);
    }
};
customElements.define('server-panel', ServerPanel);
