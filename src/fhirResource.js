import template from "./templates/fhirResource.html";

import "./components/AppBar.js";
import "./components/RoundButton.js";
import "./appTab.js";
import "./components/TabBar.js";
import "./fhirResourceJson.js";
import "./fhirResourceXml.js";
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
        this._xmlLoaded = false;
    }
    connectedCallback() {
        this._shadow.getElementById("back").addEventListener('click', () => {
            location.hash = `#${this._resourceType.type}`;
        });

        this._shadow.getElementById("help").addEventListener('click', () => {
            window.open(`${FhirService.helpUrl(this._resourceType.type)}#resource`, "FhirBrowserHelp");
        });

        this._shadow.getElementById('download').addEventListener("click", () => {
            const file = new File([JSON.stringify(this._resource)], this._resource.id, {
                type: 'data:text/json;charset=utf-8',
            });
            const url = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${this._resourceType.type}#${file.name}.json`;
            this._shadow.appendChild(link);
            link.click();
            this._shadow.removeChild(link);
            window.URL.revokeObjectURL(url);
        });

        this._shadow.getElementById('copy').addEventListener("click", () => {
            navigator.clipboard.writeText(JSON.stringify(this._resource)).then(function () {
                SnackbarsService.show("Copying to clipboard was successful");
            }, function (err) {
                console.error('Async: Could not copy text: ', err);
            });
        });

        this._shadow.getElementById('share').addEventListener("click", () => {
            const fileName = `${this._resourceType.type}.${this._resource.id}.txt`;
            const file = new File([JSON.stringify(this._resource)], fileName, { type: 'text/plain' });
            navigator.share({
                "title": fileName,
                "files": [file]
            }).then(() => {
                console.log('sharing was successful!');
            }, (err) => {
                console.error('Could not share resource: ', err);
            });;
        });

        this._shadow.querySelector("tab-bar").addEventListener('click', ({ detail }) => {
            const tabId = detail.tab.id;
            const xmlView = this._shadow.getElementById('xmlView');
            this._shadow.getElementById("jsonView").hidden = (tabId !== 'tabJson');
            this._shadow.getElementById("xmlView").hidden = (tabId !== 'tabXml');
            if (tabId == 'tabXml' && !this._xmlLoaded) {
                FhirService.readXml(this._resourceType.type, this._resourceId).then(resource => {
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(resource, "application/xml");
                    xmlView.source = xml;
                    this._xmlLoaded = true;
                }).catch((e) => {
                    //todo
                });
            }
        });

        this._shadow.querySelector('fhir-references').addEventListener('referenceClick', ({ detail }) => {
            location.hash = `#${detail.resourceType}?${this._resourceType.type.toLowerCase()}=${this._resourceId}`;
        });
    }

    load({ resourceType, resourceId }) {
        const references = FhirService.references(resourceType);
        const refPanel = this._shadow.getElementById('refPanel');
        if (references.length) {
            this._shadow.querySelector('fhir-references').load(references);
            refPanel.style.display = 'flex';
        } else {
            refPanel.style.display = 'none';
        }
        if (resourceType === this._resourceType && resourceId === this._resourceId) return;
        const header = this._shadow.getElementById('header');
        const tabBar = this._shadow.querySelector('tab-bar');
        const jsonView = this._shadow.getElementById('jsonView');
        const xmlView = this._shadow.getElementById('xmlView');
        const shareBtn = this._shadow.getElementById("share");
        const copyBtn = this._shadow.getElementById("copy");
        const downloadBtn = this._shadow.getElementById("download");

        this._shadow.getElementById('title').innerText = resourceType.type;
        header.classList.remove('error');
        this._shadow.getElementById("error").hidden = true;
        tabBar.hidden = false;
        tabBar.select('tabJson');

        xmlView.clear();
        this._xmlLoaded = false;

        jsonView.clear();
        FhirService.read(resourceType.type, resourceId).then(resource => {
            this._resourceType = resourceType;
            this._resourceId = resourceId;

            this._resource = resource;
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
            this._resource = null;
            shareBtn.hidden = true;
            copyBtn.hidden = true;
            downloadBtn.hidden = true;
        });
    }

};

customElements.define('fhir-resource', FhirResource)
