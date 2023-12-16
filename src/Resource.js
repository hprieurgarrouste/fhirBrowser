import template from "./templates/Resource.html";

import "./components/AppBar"
import "./components/Chips"
import "./components/RoundButton"
import "./components/SidePanel"
import "./components/AppTabs"

import "./ResourceHistory"
import "./ResourceReferences"
//import "./ResourceFormView"
import "./ResourceFormEditor"
import "./ResourceJsonView"
import "./ResourceTtlView"
import "./ResourceXmlView"

import { FhirService } from "./services/Fhir"
import { PreferencesService } from "./services/Preferences"
import { SnackbarsService } from "./services/Snackbars"


class Resource extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resourceType = null;
        this._resourceId = null;
        this._resource = {};
    }

    connectedCallback() {
        this._shadow.getElementById("help").onclick = this.helpClick;

        this._shadow.getElementById('download').onclick = this.downloadClick;

        this._shadow.getElementById('copy').onclick = this.copyClick;

        this._shadow.getElementById('share').onclick = this.shareClick;

        this._shadow.getElementById('referencesToggle').onclick = this.referenceToggleClick;

        this._shadow.getElementById('historyToggle').onclick = this.historyToggleClick;

        this._shadow.querySelector("app-tabs").addEventListener('select', this.tabSelect);

        FhirService.addListener(this.serverChanged);
    }

    tabSelect = ({ detail }) => {
        if (this._resourceType?.type && this._resourceId) {
            switch (detail.caption) {
                case 'json':
                    this.getJson(this._resourceType.type, this._resourceId)
                        .then(resource => this._shadow.querySelector('resource-json-view').source = resource);
                    break;
                case 'xml':
                    this.getXml(this._resourceType.type, this._resourceId)
                        .then(resource => {
                            const parser = new DOMParser();
                            const xml = parser.parseFromString(resource, "application/xml");
                            this._shadow.querySelector('resource-xml-view').source = xml;
                        });
                    break;
                case 'ttl':
                    this.getTtl(this._resourceType.type, this._resourceId)
                        .then(resource => this._shadow.querySelector('resource-ttl-view').source = resource);
                    break;
                case 'form':
                    const resource = this.getJson(this._resourceType.type, this._resourceId);
                    const view = this._shadow.querySelector('resource-form-editor');
                    if (resource && view) view.source = resource;
                    break;
            }

            const historyPanel = this._shadow.querySelector('resource-history');
            if (historyPanel && !historyPanel.hidden) {
                historyPanel.load(this._resourceType, this._resourceId);
            }
        }
    }

    async getJson(type, id) {
        if (!this._resource.json) {
            let resource = null;
            try {
                resource = await FhirService.read(this._resourceType.type, this._resourceId);
            } catch (e) {
                SnackbarsService.show('An error occurred while reading json format',
                    undefined,
                    undefined,
                    'error'
                );
            } finally {
                this._resource.json = resource;
            };
        }
        return this._resource.json;
    }

    async getXml(type, id) {
        if (!this._resource.xml) {
            let resource = null;
            try {
                resource = await FhirService.readXml(this._resourceType.type, this._resourceId);
            } catch (e) {
                SnackbarsService.show('An error occurred while reading xml format',
                    undefined,
                    undefined,
                    'error'
                );
            } finally {
                this._resource.xml = resource;
            };
        }
        return this._resource.xml;
    }

    async getTtl(type, id) {
        if (!this._resource.ttl) {
            let resource = null;
            try {
                resource = await FhirService.readTtl(this._resourceType.type, this._resourceId);
            } catch (e) {
                SnackbarsService.show('An error occurred while reading ttl format',
                    undefined,
                    undefined,
                    'error'
                );
            } finally {
                this._resource.ttl = resource;
            };
            return this._resource.ttl;
        }
    }

    helpClick = () => {
        window.open(`${FhirService.helpUrl(this._resourceType.type)}#resource`, "FhirBrowserHelp");
    };

    downloadClick = () => {
        let content = this.getCurrentContent(), type, ext;
        switch (content.type) {
            case "ttl":
                type = 'data:text/plain;charset=utf-8';
                ext = 'txt';
                break;
            case "xml":
                type = 'data:text/xml;charset=utf-8';
                ext = 'xml';
                break;
            case "json":
            default:
                type = 'data:text/json;charset=utf-8';
                ext = 'json';
                break;
        }
        const file = new File([content.value], this._resourceId, {
            'type': type
        });
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this._resourceType.type}#${file.name}.${ext}`;
        this._shadow.appendChild(link);
        link.click();
        this._shadow.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    copyClick = () => {
        let content = this.getCurrentContent().value;
        navigator.clipboard.writeText(content).then(function () {
            SnackbarsService.show("Copying to clipboard was successful");
        }, function (err) {
            SnackbarsService.error("Could not copy text");
        });
    };

    shareClick = () => {
        let content = this.getCurrentContent().value;
        const fileName = `${this._resourceType.type}.${this._resourceId}.txt`;
        const file = new File([content], fileName, { type: 'text/plain' });
        navigator.share({
            "title": fileName,
            "files": [file]
        });
    };

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

    getCurrentContent = () => {
        let content = {};
        switch (this._shadow.querySelector("app-tabs").value) {
            case "xml":
                content.value = this._resource.xml;
                content.type = 'xml';
                break;
            case "ttl":
                content.value = this._resource.ttl;
                content.type = 'ttl';
                break;
            case "json":
            default:
                content.value = JSON.stringify(this._resource.json);
                content.type = 'json';
                break;
        }
        return content;
    }

    serverChanged = () => {
        const tabs = this._shadow.querySelector("app-tabs");
        while (tabs.firstChild) tabs.removeChild(tabs.lastChild);

        if (FhirService.formatEnable("json")) {
            const view = document.createElement('resource-json-view');
            const section = document.createElement('section');
            section.dataset.caption = 'json';
            section.appendChild(view);
            this._shadow.querySelector('app-tabs').appendChild(section);
        }

        if (FhirService.formatEnable("xml")) {
            const view = document.createElement('resource-xml-view');
            const section = document.createElement('section');
            section.dataset.caption = 'xml';
            section.appendChild(view);
            this._shadow.querySelector('app-tabs').appendChild(section);
        }

        if (FhirService.formatEnable("ttl")) {
            const view = document.createElement('resource-ttl-view');
            const section = document.createElement('section');
            section.dataset.caption = 'ttl';
            section.appendChild(view);
            this._shadow.querySelector('app-tabs').appendChild(section);
        }

        const formEnable = PreferencesService.get('experimental');
        if (formEnable) {
            const view = document.createElement('resource-form-editor');
            const section = document.createElement('section');
            section.dataset.caption = 'form';
            section.appendChild(view);
            this._shadow.querySelector('app-tabs').appendChild(section);
        }
    }

    load = ({ resourceType, resourceId }) => {
        if (resourceType === this._resourceType && resourceId === this._resourceId) return;
        this._resourceType = resourceType;
        this._resourceId = resourceId;

        if (window.matchMedia("(max-width: 480px)").matches) {
            this._shadow.querySelector("resource-references").hidden = true;
            this._shadow.querySelector("resource-history").hidden = true;
        }

        if (!resourceType.interaction.find(({ code }) => 'vread' == code)) {
            this._shadow.getElementById('historyToggle').hidden = true;
            this._shadow.querySelector('resource-history').hidden = true;
        } else {
            this._shadow.getElementById('historyToggle').hidden = false;
        }

        if (this._shadow.querySelector('resource-references').load(resourceType, resourceId)) {
            this._shadow.getElementById('referencesToggle').hidden = false;
        } else {
            this._shadow.getElementById('referencesToggle').hidden = true;
            this._shadow.querySelector('resource-references').hidden = true;
        }

        this._shadow.getElementById('title').innerText = resourceType.type;

        this._resource = {};
        this._shadow.querySelector('app-tabs').value = 'json';
    }

};

customElements.define('fhir-resource', Resource)
