import "./fhirResourceJson.js";
import "./fhirResourceHtml.js";
import "./appTabs.js";
import "./appTitle.js";

customElements.define('fhir-resource', class FhirResource extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = `
            <link rel="stylesheet" href="./material.css">
            <style>
                #wrapper {
                    display:flex;
                    flex-direction: column;
                    height : 100%;
                }
                #tabs {
                    border-bottom:1px solid var(--border-color, gray);
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
                }
                #error {
                    padding: 1em;
                }
            </style>
            <div id="wrapper">
                <app-title id="header">
                    <app-round-button slot="left" id="back" title="back">arrow_back</app-round-button>
                    <app-round-button id="share" title="Share">share</app-round-button>
                    <app-round-button id="copy" title="Copy to clipboard">content_copy</app-round-button>
                    <app-round-button id="download" title="Download">download</app-round-button>
                    <app-round-button id="help" title="Help">help</app-round-button>
                </app-title>
                <app-tabs id="tabs">
                    <app-tab id="tabJson" selected>Json</app-tab>
                    <app-tab id="tabHtml">Html</app-tab>
                </app-tabs>
                <fhir-resource-json id="jsonView"></fhir-resource-json>
                <fhir-resource-html id="htmlView" hidden></fhir-resource-html>
                <span id="error"></span>
            </div>
        `;
        this._jsonView = this._shadow.getElementById('jsonView');
        this._htmlView = this._shadow.getElementById('htmlView');
        this._server = null;
        this._resourceType = null;
        this._resourceId = null;
    }
    connectedCallback() {
        this._shadow.getElementById("back").addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent("back", {
                bubbles: false,
                cancelable: false
            }));
        });

        this._shadow.getElementById("help").addEventListener('click', () => {
            window.open(`${this._resourceType.profile}#resource`, "_blank");
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
                console.log('Async: Copying to clipboard was successful!');
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

        this._shadow.getElementById("tabs").addEventListener('click', ({ detail }) => {
            const tabId = detail.tabId;
            this._shadow.getElementById("jsonView").hidden = (tabId !== 'tabJson');
            this._shadow.getElementById("htmlView").hidden = (tabId !== 'tabHtml');
        });
    }

    load({ server, resourceType, resourceId }) {
        this._server = server;
        this._resourceType = resourceType;
        this._resourceId = resourceId;

        const header = this._shadow.getElementById('header');
        header.setAttribute('caption', resourceType.type);
        const tabs = this._shadow.getElementById('tabs');

        this.fetchResource(server, resourceType, resourceId).then(resource => {
            header.classList.remove('error');
            this._shadow.getElementById("error").hidden = true;
            tabs.hidden = false;
            tabs.select('tabJson');
            this._resource = resource;
            this._jsonView.source = resource;
            this._htmlView.source = resource;
            this._shadow.getElementById("share").hidden = false;
            this._shadow.getElementById("copy").hidden = false;
            this._shadow.getElementById("download").hidden = false;
        }).catch((e) => {
            header.classList.add('error');
            const error = this._shadow.getElementById("error");
            error.hidden = false;
            error.innerText = e;
            tabs.hidden = true;
            this._shadow.getElementById("jsonView").hidden = true;
            this._shadow.getElementById("htmlView").hidden = true;
            this._resource = null;
            this._shadow.getElementById("share").hidden = true;
            this._shadow.getElementById("copy").hidden = true;
            this._shadow.getElementById("download").hidden = true;
        });
    }

    async fetchResource(server, resourceType, id) {
        const response = await fetch(`${server.url}/${resourceType.type}/${id}?_format=json`, {
            "headers": server.headers
        });
        return response.json();
    }

});
