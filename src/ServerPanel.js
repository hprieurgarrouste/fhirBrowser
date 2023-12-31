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
        this._serverTitle = shadow.getElementById('serverTitle');
        this._appTabs = shadow.querySelector('app-tabs');
        this._serverResources = shadow.querySelector('server-resources');
        this._serverCapabilities = shadow.querySelector('server-capabilities');
    }

    connectedCallback() {
        FhirService.addListener(this.serverChanged);
    }

    serverChanged = () => {
        const server = FhirService.server;
        this._serverTitle.setAttribute('data-primary', server.serverCode);
        this._serverTitle.setAttribute('data-secondary', server.capabilities?.implementation?.description || server.capabilities?.software?.name || server.url);
        this._serverResources.load(server.capabilities);
        this._serverCapabilities.load(server.capabilities);
    }

    /**
     * @param {string} resourceType
     */
    set value(resourceType) {
        this._appTabs.value = 'Resource Types';
        this._serverResources.value = resourceType;
    }
};
customElements.define('server-panel', ServerPanel);
