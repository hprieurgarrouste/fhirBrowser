import template from "./templates/fhirResource.html";

import "./components/AppBar.js";
import "./components/RoundButton.js";
import "./appTab.js";
import "./components/TabBar.js";
import "./fhirResourceJson.js";
import "./fhirResourceXml.js";
import "./fhirResourceTtl.js";
import "./components/Chips.js";
import "./fhirReferences.js";

import { FhirService } from "./services/Fhir.js";
import { SnackbarsService } from "./services/Snackbars.js";

class FhirResource extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resourceType = null;
        this._resourceId = null;
        this._resource = {};
    }
    connectedCallback() {
        this._shadow.getElementById("help").addEventListener('click', () => {
            window.open(`${FhirService.helpUrl(this._resourceType.type)}#resource`, "FhirBrowserHelp");
        });

        this._shadow.getElementById('download').addEventListener("click", () => {
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
        });

        this._shadow.getElementById('copy').addEventListener("click", () => {
            let content = this.getCurrentContent().value;
            navigator.clipboard.writeText(content).then(function () {
                SnackbarsService.show("Copying to clipboard was successful");
            }, function (err) {
                SnackbarsService.error("Could not copy text");
            });
        });

        this._shadow.getElementById('share').addEventListener("click", () => {
            let content = this.getCurrentContent().value;
            const fileName = `${this._resourceType.type}.${this._resourceId}.txt`;
            const file = new File([content], fileName, { type: 'text/plain' });
            navigator.share({
                "title": fileName,
                "files": [file]
            });
        });

        this._shadow.querySelector("tab-bar").addEventListener('click', ({ detail }) => {
            const tabId = detail.tab.id;
            const xmlView = this._shadow.getElementById('xmlView');
            const ttlView = this._shadow.getElementById('ttlView');
            this._shadow.getElementById("jsonView").hidden = (tabId !== 'tabJson');
            xmlView.hidden = (tabId !== 'tabXml');
            ttlView.hidden = (tabId !== 'tabTtl');
            if (tabId == 'tabXml' && !this._resource.xml) {
                FhirService.readXml(this._resourceType.type, this._resourceId).then(resource => {
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(resource, "application/xml");
                    this._resource.xml = resource;
                    xmlView.source = xml;
                }).catch((e) => {
                    this._resource.xml = null;
                });
            } else if (tabId == 'tabTtl' && !this._resource.ttl) {
                FhirService.readTtl(this._resourceType.type, this._resourceId).then(resource => {
                    this._resource.ttl = resource;
                    ttlView.source = resource;
                }).catch((e) => {
                    this._resource.xml = null;
                });
            }

        });
    }

    getCurrentContent() {
        let content = {};
        switch (this._shadow.querySelector('app-tab[selected]').id) {
            case "tabXml":
                content.value = this._resource.xml;
                content.type = 'xml';
                break;
            case "tabTtl":
                content.value = this._resource.ttl;
                content.type = 'ttl';
                break;
            case "tabJson":
            default:
                content.value = JSON.stringify(this._resource.json);
                content.type = 'json';
                break;
        }
        return content;
    }

    load({ resourceType, resourceId }) {
        if (resourceType === this._resourceType && resourceId === this._resourceId) return;

        const anyReferences = this._shadow.querySelector('fhir-references').load(resourceType, resourceId);
        this._shadow.getElementById('refPanel').style.display = anyReferences ? 'flex' : 'none';

        const header = this._shadow.getElementById('header');
        const tabBar = this._shadow.querySelector('tab-bar');
        const jsonView = this._shadow.getElementById('jsonView');
        const xmlView = this._shadow.getElementById('xmlView');
        const ttlView = this._shadow.getElementById('ttlView');
        const shareBtn = this._shadow.getElementById("share");
        const copyBtn = this._shadow.getElementById("copy");
        const downloadBtn = this._shadow.getElementById("download");

        const ttlFormatEnable = FhirService.formatEnable("ttl");
        this._shadow.getElementById("tabTtl").hidden = !ttlFormatEnable;
        ttlView.hidden = !ttlFormatEnable;

        const xmlFormatEnable = FhirService.formatEnable("xml");
        this._shadow.getElementById("tabXml").hidden = !xmlFormatEnable;
        xmlView.hidden = !xmlFormatEnable;

        this._shadow.getElementById('title').innerText = resourceType.type;
        header.classList.remove('error');
        this._shadow.getElementById("error").hidden = true;
        tabBar.hidden = false;
        tabBar.select('tabJson');

        this._resource = {};
        jsonView.clear();
        xmlView.clear();
        ttlView.clear();

        FhirService.read(resourceType.type, resourceId).then(resource => {
            this._resourceType = resourceType;
            this._resourceId = resourceId;

            this._resource.json = resource;
            jsonView.source = resource;
            shareBtn.hidden = false;
            copyBtn.hidden = false;
            downloadBtn.hidden = false;
        }).catch((e) => {
            header.classList.add('error');
            const error = this._shadow.getElementById("error");
            error.hidden = false;
            error.innerText = e;
            tabBar.hidden = true;
            jsonView.hidden = true;
            xmlView.hidden = true;
            this._resource.json = null;
            shareBtn.hidden = true;
            copyBtn.hidden = true;
            downloadBtn.hidden = true;
        });
    }

};

customElements.define('fhir-resource', FhirResource)
