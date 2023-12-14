import template from "./templates/fhirResource.html";

import "./components/AppBar"
import "./components/Chips"
import "./components/RoundButton"
import "./components/SidePanel"
import "./components/AppTabs"

import "./FhirHistory"
import "./FhirReferences"
//import "./FhirResourceForm"
import "./FhirResourceFormEditor"
import "./FhirResourceJson"
import "./FhirResourceTtl"
import "./FhirResourceXml"

import { FhirService } from "./services/Fhir"
import { PreferencesService } from "./services/Preferences"
import { SnackbarsService } from "./services/Snackbars"


class FhirResource extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resourceType = null;
        this._resourceId = null;
        this._resource = {};
    }

    async getJson(type, id) {
        let resource = null;
        try {
            resource = await FhirService.read(this._resourceType.type, this._resourceId);
            this._resource.json = resource;
            const view = this._shadow.querySelector('fhir-resource-json');
            if (view) view.source = resource;
        } catch (e) {
            SnackbarsService.show('An error occurred while reading json',
                undefined,
                undefined,
                'error'
            );
        };
        return resource;
    }

    connectedCallback() {
        this._shadow.getElementById("help").onclick = this.helpClick;

        this._shadow.getElementById('download').onclick = this.downloadClick;

        this._shadow.getElementById('copy').onclick = this.copyClick;

        this._shadow.getElementById('share').onclick = this.shareClick;

        this._shadow.getElementById('referencesToggle').onclick = this.referenceToggleClick;

        this._shadow.getElementById('historyToggle').onclick = this.historyToggleClick;

        this._shadow.querySelector("app-tabs").addEventListener('select', ({ detail }) => {
            if (this._resourceType?.type && this._resourceId) {
                switch (detail.caption) {
                    case 'json':
                        if (!this._resource.json) {
                            this._resource.json = this.getJson(this._resourceType.type, this._resourceId);
                        }
                        break;
                    case 'xml':
                        FhirService.readXml(this._resourceType.type, this._resourceId).then(resource => {
                            this._resource.xml = resource;
                            const parser = new DOMParser();
                            const xml = parser.parseFromString(resource, "application/xml");
                            const view = this._shadow.querySelector('fhir-resource-xml');
                            if (view) view.source = xml;
                        }).catch((e) => {
                            this._resource.xml = null;
                            SnackbarsService.show('An error occurred while reading xml',
                                undefined,
                                undefined,
                                'error'
                            );
                        });
                        break;
                    case 'ttl':
                        FhirService.readTtl(this._resourceType.type, this._resourceId).then(resource => {
                            this._resource.ttl = resource;
                            const view = this._shadow.querySelector('fhir-resource-ttl');
                            if (view) view.source = resource;
                        }).catch((e) => {
                            this._resource.ttl = null;
                            SnackbarsService.show('An error occurred while reading ttl',
                                undefined,
                                undefined,
                                'error'
                            );
                        });
                        break;
                    case 'form':
                        const view = this._shadow.querySelector('fhir-resource-form');
                        if (view) view.source = this._resource.json;
                        break;
                }

                const historyPanel = this._shadow.querySelector('fhir-history');
                if (historyPanel && !historyPanel.hidden) {
                    historyPanel.load(this._resourceType, this._resourceId);
                }
            }
        });
        FhirService.addListener(this.serverChanged);
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
        const panel = this._shadow.querySelector('fhir-references');
        if (panel.hidden) this._shadow.querySelector('fhir-history').hidden = true;
        panel.hidden = !panel.hidden;
    };

    historyToggleClick = () => {
        const panel = this._shadow.querySelector('fhir-history');
        if (panel.hidden) {
            this._shadow.querySelector('fhir-references').hidden = true;
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
            const view = document.createElement('fhir-resource-json');
            const section = document.createElement('section');
            section.dataset.caption = 'json';
            section.appendChild(view);
            this._shadow.querySelector('app-tabs').appendChild(section);
        }

        if (FhirService.formatEnable("xml")) {
            const view = document.createElement('fhir-resource-xml');
            const section = document.createElement('section');
            section.dataset.caption = 'xml';
            section.appendChild(view);
            this._shadow.querySelector('app-tabs').appendChild(section);
        }

        if (FhirService.formatEnable("ttl")) {
            const view = document.createElement('fhir-resource-ttl');
            const section = document.createElement('section');
            section.dataset.caption = 'ttl';
            section.appendChild(view);
            this._shadow.querySelector('app-tabs').appendChild(section);
        }

        const formEnable = PreferencesService.get('experimental');
        if (formEnable) {
            const view = document.createElement('fhir-resource-form');
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
            this._shadow.querySelector("fhir-references").hidden = true;
            this._shadow.querySelector("fhir-history").hidden = true;
        }

        if (!resourceType.interaction.find(({ code }) => 'vread' == code)) {
            this._shadow.getElementById('historyToggle').hidden = true;
            this._shadow.querySelector('fhir-history').hidden = true;
        } else {
            this._shadow.getElementById('historyToggle').hidden = false;
        }

        if (this._shadow.querySelector('fhir-references').load(resourceType, resourceId)) {
            this._shadow.getElementById('referencesToggle').hidden = false;
        } else {
            this._shadow.getElementById('referencesToggle').hidden = true;
            this._shadow.querySelector('fhir-references').hidden = true;
        }

        this._shadow.getElementById('title').innerText = resourceType.type;

        this._resource = {};
        this._shadow.querySelector('app-tabs').value = 'json';
    }

};

customElements.define('fhir-resource', FhirResource)
