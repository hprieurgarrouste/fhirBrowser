import template from "./templates/ServerPanel.html";

import M2Tabs from "./components/M2Tabs"
import M2ListItem from "./components/M2ListItem";

import ServerResources from "./ServerResources"
import ServerCapabilities from "./ServerCapabilities"

import context from "./services/Context"

export default class ServerPanel extends HTMLElement {
    /** @type {M2ListItem} */
    #serverTitle;
    /** @type {ServerResources} */
    #serverResources;
    /** @type {ServerCapabilities} */
    #serverCapabilities;
    /** @type {M2Tabs} */
    #tabs;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        this.#serverTitle = shadow.getElementById('serverTitle');
        this.#tabs = shadow.querySelector('m2-tabs');
        this.#serverResources = shadow.querySelector('server-resources');
        this.#serverCapabilities = shadow.querySelector('server-capabilities');
    }

    connectedCallback() {
        context.addListener(this.#serverChanged);
    }

    #serverChanged = () => {
        const server = context.server;
        this.#serverTitle.setAttribute('data-primary', server.serverCode);
        this.#serverTitle.setAttribute('data-secondary', server.capabilities?.implementation?.description || server.capabilities?.software?.name || server.url);
        this.#serverResources.load(server.capabilities);
        this.#serverCapabilities.load(server.capabilities);
    }

    /**
     * @param {String} resourceType
     */
    set value(resourceType) {
        this.#tabs.value = 'Resource Types';
        this.#serverResources.value = resourceType;
    }
};
customElements.define('server-panel', ServerPanel);
