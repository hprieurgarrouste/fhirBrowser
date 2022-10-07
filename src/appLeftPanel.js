import "./appCircularLoader.js";
import "./fhirMetadata.js";

customElements.define('app-left-panel', class AppLeftPanel extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(AppLeftPanelTemplate.content.cloneNode(true));
    }
    connectedCallback() {
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

    /**
     * @param {any} server
     */
    set server(server) {
        const metadata = this._shadow.getElementById("metadata");
        const loader = this._shadow.getElementById("waiting");
        metadata.hidden = true;
        loader.hidden = false;
        this.fetchMetadata(server).then(data => {
            metadata.metadata = data;
            loader.hidden = true;
            metadata.hidden = false;
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
        app-circular-loader {
            font-size: 2em;
            text-align: center;
            padding-top: 1em;
        }
    </style>
    <div id="wrapper">
        <div id="content">
            <app-circular-loader id="waiting" hidden></app-circular-loader>
            <fhir-metadata id="metadata"></fhir-metadata>
        </div>
    </div>
`;