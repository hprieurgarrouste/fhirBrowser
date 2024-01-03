import template from "./templates/Resource.html";

import "./components/M2AppBar"
import "./components/M2RoundButton"
import "./components/M2SidePanel"
import "./components/M2Tabs"

import "./ResourceHistory"
import "./ResourceReferences"
import "./ResourceJsonView"
import "./ResourceTtlView"
import "./ResourceXmlView"

import context from "./services/Context"
import fhirService from "./services/Fhir"

class Resource extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        shadow.getElementById("help").onclick = this.helpClick;

        this._referencesToggle = shadow.getElementById('referencesToggle');
        this._referencesToggle.onclick = this.referenceToggleClick;
        this._referencesPanel = shadow.querySelector('resource-references');

        this._historyDisabled = null;
        this._historyToggle = shadow.getElementById('historyToggle');
        this._historyToggle.onclick = this.historyToggleClick;
        this._historyPanel = shadow.querySelector('resource-history');

        this._tabs = shadow.querySelector("m2-tabs");
        this._tabs.addEventListener('select', this.tabSelect);

        this._title = shadow.getElementById('title');

        this._resourceType = null;
        this._resourceId = null;
        this._views = {};
    }

    connectedCallback() {
        context.addListener(this.serverChanged);
        new MutationObserver(this.panelHiddenObserver).observe(this._referencesPanel, { attributes: true });
        new MutationObserver(this.panelHiddenObserver).observe(this._historyPanel, { attributes: true });
    }

    panelHiddenObserver = (mutationList) => {
        mutationList.forEach(({ type, attributeName, target }) => {
            if ('attributes' == type && 'hidden' == attributeName) {
                if (target == this._historyPanel) {
                    this._historyToggle.hidden = this._historyDisabled || !target.hidden
                } else if (target == this._referencesPanel) {
                    this._referencesToggle.hidden = !target.hidden
                }
            }
        })
    }

    tabSelect = ({ detail }) => {
        const format = detail.caption;
        const hashSearchParams = location.hash.match(/\?([^?]+)$/);
        if (hashSearchParams?.length > 0) {
            const searchParams = new URLSearchParams(hashSearchParams[1]);
            searchParams.set('_format', format);
            location.hash = location.hash.replace(/\?[^?]+$/, `?${searchParams.toString()}`);
        } else {
            location.hash = `${location.hash}?_format=${format}`;
        }
    }

    referenceToggleClick = () => {
        if (this._referencesPanel.hidden) {
            this._historyPanel.hidden = true;
            this._referencesPanel.load(this._resourceType, this._resourceId);
        }
        this._referencesPanel.hidden = !this._referencesPanel.hidden;
    };

    historyToggleClick = () => {
        if (this._historyPanel.hidden) {
            this._referencesPanel.hidden = true;
            this._historyPanel.load(this._resourceType, this._resourceId);
        }
        this._historyPanel.hidden = !this._historyPanel.hidden;
    };

    helpClick = () => {
        window.open(`${fhirService.helpUrl(this._resourceType.type)}#resource`, "FhirBrowserHelp");
    };

    serverChanged = () => {
        while (this._tabs.firstChild) this._tabs.removeChild(this._tabs.lastChild);

        this._views = {};
        const server = context.server;

        if (server.isFormatEnable('json')) {
            const view = document.createElement('resource-json-view');
            const section = document.createElement('section');
            section.dataset.caption = 'json';
            section.appendChild(view);
            this._tabs.appendChild(section);
            this._views.json = view;
        }

        if (server.isFormatEnable('xml')) {
            const view = document.createElement('resource-xml-view');
            const section = document.createElement('section');
            section.dataset.caption = 'xml';
            section.appendChild(view);
            this._tabs.appendChild(section);
            this._views.xml = view;
        }

        if (server.isFormatEnable('ttl')) {
            const view = document.createElement('resource-ttl-view');
            const section = document.createElement('section');
            section.dataset.caption = 'ttl';
            section.appendChild(view);
            this._tabs.appendChild(section);
            this._views.ttl = view;
        }
    }

    /**
     * @param {any} resource
     */
    set source(resource) {
        let format;
        if (resource instanceof Document) {
            format = 'xml';
        } else if ('object' == typeof (resource)) {
            format = 'json';
        } else {
            format = 'ttl';
        }
        if (format) {
            const view = this._views[format];
            view.source = resource;
            let resourceType = view.resourceType;
            this._title.innerText = resourceType;
            const resourceId = view.resourceId;

            if (resourceId != this._resourceId || resourceType != this._resourceType?.type) {
                this._resourceType = context.server.capabilities.rest[0].resource.find(res => res.type === resourceType);
                this._resourceId = resourceId;
                Object.entries(this._views).filter(([key,]) => key != format).forEach(([, value]) => value.clear());
            }
            this._tabs.value = format;
        }

        if (window.matchMedia("(max-width: 480px)").matches) {
            this._referencesPanel.hidden = true;
            this._historyPanel.hidden = true;
        }

        this._historyDisabled = this._resourceType?.interaction.find(({ code }) => 'vread' == code) == undefined;
        if (this._historyDisabled) {
            this._historyPanel.hidden = true;
            this._historyToggle.hidden = true;
        } else {
            this._historyToggle.hidden = !this._historyPanel.hidden;
        }

        if (!this._historyPanel.hidden) this._historyPanel.load(this._resourceType, this._resourceId);
        if (!this._referencesPanel.hidden) this._referencesPanel.load(this._resourceType, this._resourceId);
    }

    get resourceType() {
        return this._resourceType;
    }
};

customElements.define('fhir-resource', Resource)
