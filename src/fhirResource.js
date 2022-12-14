import "./components/AppBar.js";
import "./components/RoundButton.js";
import "./appTab.js";
import "./components/TabBar.js";
import "./fhirResourceJson.js";
import "./fhirResourceHtml.js";

import { FhirService } from "./services/Fhir.js";
import { SnackbarsService } from "./services/Snackbars.js";

(function () {
    class FhirResource extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
            this._resourceType = null;
            this._resourceId = null;
        }
        connectedCallback() {
            this._shadow.getElementById("back").addEventListener('click', () => {
                location.hash = `#${this._resourceType.type}`;
            });

            this._shadow.getElementById("help").addEventListener('click', () => {
                window.open(`${this._resourceType.profile}#resource`, "FhirBrowserHelp");
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
                this._shadow.getElementById("jsonView").hidden = (tabId !== 'tabJson');
                this._shadow.getElementById("htmlView").hidden = (tabId !== 'tabHtml');
            });
        }

        load({ resourceType, resourceId }) {
            if (resourceType === this._resourceType && resourceId === this.resourceId) return;
            const header = this._shadow.getElementById('header');
            const tabBar = this._shadow.querySelector('tab-bar');
            const jsonView = this._shadow.getElementById('jsonView');
            const htmlView = this._shadow.getElementById('htmlView');
            const shareBtn = this._shadow.getElementById("share");
            const copyBtn = this._shadow.getElementById("copy");
            const downloadBtn = this._shadow.getElementById("download");

            this._shadow.getElementById('title').innerText = resourceType.type;
            FhirService.read(resourceType.type, resourceId).then(resource => {
                this._resourceType = resourceType;
                this._resourceId = resourceId;

                header.classList.remove('error');
                this._shadow.getElementById("error").hidden = true;
                tabBar.hidden = false;
                tabBar.select('tabJson');
                this._resource = resource;
                jsonView.source = resource;
                htmlView.source = resource;
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
                htmlView.hidden = true;
                this._resource = null;
                shareBtn.hidden = true;
                copyBtn.hidden = true;
                downloadBtn.hidden = true;
            });
        }

    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link rel="stylesheet" href="./assets/material.css">
        <style>
            #wrapper {
                display:flex;
                flex-direction: column;
                height : 100%;
            }
            #title {
                margin:0;
                overflow:hidden;
                text-overflow:ellipsis;
            }
            #jsonView {
                flex:1 1 auto;
                height:0;
            }
            #htmlView {
                flex:1 1 auto;
                height:0;
            }
            #header.error {
                background-color: var(--background-error, transparent);
                color: white;
            }
            #error {
                padding: 1em;
            }
        </style>
        <div id="wrapper">
            <app-bar id="header">
                <round-button slot="left" id="back" title="back" data-icon="arrow_back"></round-button>
                <h3 slot="middle" id="title"></h3>
                <round-button slot="right" id="share" title="Share" data-icon="share"></round-button>
                <round-button slot="right" id="copy" title="Copy to clipboard" data-icon="content_copy"></round-button>
                <round-button slot="right" id="download" title="Download" data-icon="download"></round-button>
                <round-button slot="right" id="help" title="Help" data-icon="help"></round-button>
            </app-bar>
            <tab-bar>
                <app-tab id="tabJson" selected>Json</app-tab>
                <app-tab id="tabHtml">Html</app-tab>
            </tab-bar>
            <fhir-resource-json id="jsonView"></fhir-resource-json>
            <fhir-resource-html id="htmlView" hidden></fhir-resource-html>
            <span id="error"></span>
        </div>
    `;

    window.customElements.define('fhir-resource', FhirResource);
})();