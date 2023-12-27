import template from "./templates/Resource.html";

import "./components/AppBar"
import "./components/RoundButton"
import "./components/SidePanel"
import "./components/AppTabs"

import "./ResourceHistory"
import "./ResourceReferences"
import "./ResourceJsonView"
import "./ResourceTtlView"
import "./ResourceXmlView"

import { FhirService } from "./services/Fhir"
import { SnackbarsService } from "./services/Snackbars"


class Resource extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resourceType = null;
        this._resourceId = null;
        this._views = {};

        this._shadow.getElementById("help").onclick = this.helpClick;

        this._shadow.getElementById('referencesToggle').onclick = this.referenceToggleClick;

        this._shadow.getElementById('historyToggle').onclick = this.historyToggleClick;

        this._shadow.querySelector("app-tabs").addEventListener('select', this.tabSelect);

        FhirService.addListener(this.serverChanged);
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

        const historyPanel = this._shadow.querySelector('resource-history');
        if (historyPanel && !historyPanel.hidden) {
            historyPanel.load(this._resourceType, this._resourceId);
        }
    }

    referenceToggleClick = () => {
        const panel = this._shadow.querySelector('resource-references');
        if (panel.hidden) this._shadow.querySelector('resource-history').hidden = true;
        panel.hidden = !panel.hidden;
    };

    historyToggleClick = () => {
        const panel = this._shadow.querySelector('resource-history');
        if (panel.hidden) {
            this._shadow.querySelector('resource-references').hidden = true;
            panel.load(this._resourceType, this._resourceId);
        }
        panel.hidden = !panel.hidden;
    };

    helpClick = () => {
        window.open(`${FhirService.helpUrl(this._resourceType.type)}#resource`, "FhirBrowserHelp");
    };

    serverChanged = () => {
        const tabs = this._shadow.querySelector("app-tabs");
        while (tabs.firstChild) tabs.removeChild(tabs.lastChild);

        this._views = {};

        if (FhirService.formatEnable("json")) {
            const view = document.createElement('resource-json-view');
            const section = document.createElement('section');
            section.dataset.caption = 'json';
            section.appendChild(view);
            this._shadow.querySelector('app-tabs').appendChild(section);
            this._views.json = view;
        }

        if (FhirService.formatEnable("xml")) {
            const view = document.createElement('resource-xml-view');
            const section = document.createElement('section');
            section.dataset.caption = 'xml';
            section.appendChild(view);
            this._shadow.querySelector('app-tabs').appendChild(section);
            this._views.xml = view;
        }

        if (FhirService.formatEnable("ttl")) {
            const view = document.createElement('resource-ttl-view');
            const section = document.createElement('section');
            section.dataset.caption = 'ttl';
            section.appendChild(view);
            this._shadow.querySelector('app-tabs').appendChild(section);
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
            this._shadow.getElementById('title').innerText = resourceType;
            const resourceId = view.resourceId;

            if (resourceId != this._resourceId || resourceType != this._resourceType?.type) {
                this._resourceType = FhirService.server.capabilities.rest[0].resource.find(res => res.type === resourceType);
                this._resourceId = resourceId;
                Object.entries(this._views).filter(([key,]) => key != format).forEach(([, value]) => value.clear());
            }
            this._shadow.querySelector('app-tabs').value = format;
        }

        if (window.matchMedia("(max-width: 480px)").matches) {
            this._shadow.querySelector("resource-references").hidden = true;
            this._shadow.querySelector("resource-history").hidden = true;
        }

        if (!this._resourceType.interaction.find(({ code }) => 'vread' == code)) {
            this._shadow.getElementById('historyToggle').hidden = true;
            this._shadow.querySelector('resource-history').hidden = true;
        } else {
            this._shadow.getElementById('historyToggle').hidden = false;
        }

        if (this._shadow.querySelector('resource-references').load(this._resourceType, this._resourceId)) {
            this._shadow.getElementById('referencesToggle').hidden = false;
        } else {
            this._shadow.getElementById('referencesToggle').hidden = true;
            this._shadow.querySelector('resource-references').hidden = true;
        }
    }

};

customElements.define('fhir-resource', Resource)
