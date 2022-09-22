import "./fhirResourceJson.js";

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
                .header {
                    margin-bottom: 1em;
                    display: flex;
                    align-items: center;
                }
                .header > * {
                    margin-right: .5em;
                }
                #help {
                    color: var(--primary-color);
                }
                #tabs {
                    border-bottom:1px solid var(--border-color, gray);
                }
                #jsonView {
                    flex:1 1 auto;
                    overflow: auto;
                    height:0;
                }
            </style>
            <div id="wrapper">
                <h2 class="header">
                    <app-round-button id="back" title="back">arrow_back</app-round-button>
                    <span id="title"></span>
                    <app-round-button id="help" title="Help">help</app-round-button>
                </h2>
                <app-tabs id="tabs">
                    <app-tab id="tabJson" selected>Json</app-tab>
                    <app-tab id="tabMustache">Html</app-tab>
                </app-tabs>
                <fhir-resource-json id="jsonView"/>
                <div id="MustacheView"/>
            </div>
        `;
        this._jsonView = this._shadow.getElementById('jsonView');
        this._server = null;
        this._resourceType = null;
        this._resourceId = null;
    }
    connectedCallback() {
        this._shadow.getElementById("back").addEventListener('click', (event) => {
            this.dispatchEvent(new CustomEvent("back", {
                bubbles: false,
                cancelable: false
            }));
        });
        this._shadow.getElementById("help").addEventListener('click', (event) => {
            const resourceDefinition = this._server.metadata.rest[0].resource.find(r => r.type == this._resourceType);
            window.open(resourceDefinition.profile, "_blank");
        });
        this._shadow.getElementById("tabs").addEventListener('click', (event) => {
            const tabId = event.detail.tabId;
            this._shadow.getElementById("jsonView").hidden = (tabId !== 'tabJson');
            this._shadow.getElementById("MustacheView").hidden = (tabId !== 'tabMustache');
        });
    }

    load({ server, resourceType, resourceId }) {
        this._server = server;
        this._resourceType = resourceType;
        this._resourceId = resourceId;

        this._shadow.getElementById('title').innerText = resourceType;

        this.fetchResource(server, resourceType, resourceId).then(resource => {
            this._jsonView.source = resource;
        });
    }

    async fetchResource(server, resourceType, id) {
        const response = await fetch(`${server.url}/${resourceType}/${id}?_format=json`, {
            "headers": server.headers
        });
        return response.json();
    }

});
