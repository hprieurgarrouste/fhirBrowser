import "./fhirMetadata.js";
import "./fhirServerSelector.js";

customElements.define('app-left-panel', class AppLeftPanel extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppLeftPanelTemplate.content.cloneNode(true));
    }
    connectedCallback() {
        this._shadow.getElementById("serverSelector").addEventListener('serverchanged', ({ detail }) => {
            const server = detail.server;
            this.dispatchEvent(new CustomEvent("serverchanged", {
                bubbles: false,
                cancelable: false,
                "detail": {
                    "server": server
                }
            }));
            this.fetchMetadata(server).then(metadata => {
                this._shadow.getElementById("metadata").metadata = metadata;
            });
        });

        this._shadow.getElementById("metadata").addEventListener('resourceTypeSelected', ({ detail }) => {
            this.dispatchEvent(new CustomEvent("resourceTypeSelected", {
                bubbles: false,
                cancelable: false,
                "detail": {
                    "resourceType": detail.resourceType
                }
            }));
        });
    }

    async fetchMetadata(server) {
        const response = await fetch(`${server.url}/metadata?_format=json`, {
            "cache": "reload",
            "headers": server.headers
        });
        return response.json();
    }

});

const AppLeftPanelTemplate = document.createElement('template');
AppLeftPanelTemplate.innerHTML = `
    <style>
        #wrapper {
            height:100%;
        }
        #content {
            width:300px;
            display:flex;
            flex-direction: column;
            height : 100%;
        }
        #metadata {
            flex: 1 1 auto;
            height: 0;
        }
    </style>
    <div id="wrapper">
        <div id="content">
            <fhir-server-selector id="serverSelector"></fhir-server-selector>
            <fhir-metadata id="metadata"></fhir-metadata>
        </div>
    </div>
`;