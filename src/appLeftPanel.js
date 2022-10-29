import "./appCircularProgress.js";
import "./fhirMetadata.js";
import { Fhir } from "./fhir.js";

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

    load() {
        const metadata = this._shadow.getElementById("metadata");
        const loader = this._shadow.getElementById("waiting");
        metadata.hidden = true;
        loader.hidden = false;
        Fhir.capabilities().then(data => {
            metadata.metadata = data;
            loader.hidden = true;
            metadata.hidden = false;
        });
    }

});

const AppLeftPanelTemplate = document.createElement('template');
AppLeftPanelTemplate.innerHTML = `
    <style>
        main {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        #metadata {
            flex: 1 1 auto;
            height: 0;
        }
        app-circular-progress {
            font-size: 2em;
            text-align: center;
            padding-top: 1em;
        }
    </style>
    <main>
        <app-circular-progress id="waiting" hidden></app-circular-progress>
        <fhir-metadata id="metadata"></fhir-metadata>
    </main>
`;