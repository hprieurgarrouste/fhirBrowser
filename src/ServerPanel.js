import template from "./templates/ServerPanel.html";

import "./components/M2Tabs"
import "./components/M2ListItem"

import "./ServerResources"
import "./ServerCapabilities"

import context from "./services/Context"

class ServerPanel extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this._serverTitle = shadow.getElementById('serverTitle');
        this._appTabs = shadow.querySelector('m2-tabs');
        this._serverResources = shadow.querySelector('server-resources');
        this._serverCapabilities = shadow.querySelector('server-capabilities');
    }

    connectedCallback() {
        context.addListener(this.serverChanged);
    }

    serverChanged = () => {
        const server = context.server;
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
