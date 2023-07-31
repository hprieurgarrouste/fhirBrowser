import "./components/AppBar.js";
import "./components/AppDialog.js";
import "./appLeftPanel.js";
import { SnackbarsService } from "./services/Snackbars.js";
import "./fhirBundle.js";
import "./fhirResource.js";
import "./fhirServer.js";
import { FhirService } from "./services/Fhir.js";
import "./components/ColorScheme.js";
import { PreferencesService } from "./services/Preferences.js";

/* Only register a service worker if it's supported */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js');
}

(function () {
    class FhirBrowser extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
            window.addEventListener("hashchange", this.locationHandler);
            this._metadata = null;
        }

        locationHandler = async () => {
            let hash = window.location.hash.replace('#', '').trim();
            if (hash.length) {
                let path = hash.split("/");
                const resourceType = this._metadata.rest[0].resource.filter(res => res.type === path[0])[0];
                if (!resourceType) {
                    SnackbarsService.show(`Resource "${resourceType}" not found!`);
                    return;
                }
                const bdy = this._shadow.getElementById("bdy");
                bdy.style.visibility = "visible";
                if (window.matchMedia("(max-width: 480px)").matches) {
                    this._shadow.getElementById("leftPanel").classList.add("hidden");
                }
                const bundle = this._shadow.getElementById("bundle");
                if (path.length > 0 && path[1]) {
                    bundle.hidden = true;
                    const resource = this._shadow.getElementById("resource");
                    resource.load({
                        "resourceType": resourceType,
                        "resourceId": path[1]
                    });
                    return;
                }
                bundle.hidden = false;
                const metadata = this._shadow.getElementById("metadata");
                metadata.select(resourceType.type);
                bundle.load(resourceType);
            }
        }

        connectedCallback() {
            SnackbarsService.container = this._shadow;

            this._shadow.getElementById("navigation").addEventListener('click', () => {
                this._shadow.getElementById("leftPanel").classList.toggle("hidden");
            });

            this._shadow.getElementById("serverSelector").addEventListener('serverchanged', ({ detail }) => {
                this._shadow.getElementById("serverDialog").hidden = true;
                this._shadow.getElementById("bdy").style.visibility = "hidden";
                this._shadow.getElementById("serverCode").innerText = ` : ${detail.serverCode}`;
                const metadataElm = this._shadow.getElementById("metadata");
                metadataElm.clear();
                FhirService.capabilities().then(metadata => {
                    SnackbarsService.show(`Connected to "${detail.serverCode}" server.`);
                    this._metadata = metadata;
                    metadataElm.metadata = metadata;
                    metadataElm.hidden = false;
                    location.hash = "";
                    FhirService.server.version = metadata.fhirVersion;
                }).catch(error => {
                    SnackbarsService.show(`An error occurred while connecting to the server "${detail.serverCode}"`,
                        undefined,
                        undefined,
                        'error'
                    );
                });
            });

            this._shadow.getElementById('serverDialogToggle').addEventListener("click", () => {
                this._shadow.getElementById('serverDialog').hidden = false;
            });

            if (!PreferencesService.get("server")) {
                this._shadow.getElementById('serverDialog').hidden = false;
            }
        }

    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link rel="stylesheet" href="./assets/material.css">
        <style>
            :host {
                background-color: var(--background-color, rgb(255,255,255));
                color: var(--text-color-normal, rgb(0,0,0,87%));
                display: flex;
                flex-direction: column;
                font-family: Roboto, Arial, monospace;
                font-size: 1rem;
                font-weight: 400;
                height: 100vh;
                line-height: 1.5;
            }
            header {
                background-color: var(--primary-color, #000);
                color:#FFF;
            }
            #serverCode {
                text-transform: capitalize;
            }
            h3 {
                margin:0;
            }
            main {
                flex:1 1 auto;
                height : 0;
                overflow: hidden;
            }
            main > div {
                display:flex;
                flex-direction: row;
                height : 100%;
            }
            #leftPanel {
                border-right:1px solid var(--border-color, gray);
                flex: none;
                transition: all 0.3s;
                margin-left: 0;
                width:300px;
            }
            #leftPanel.hidden {
                transition: all 0.3s;
                margin-left: -300px;
            }
            #bdy {
                flex: 1 1 auto;
                overflow: hidden;
                width: 0;
                /*display: flex;
                flex-direction: row;*/
                position: relative;
                block-size: 100%;
                display: grid;
                grid-auto-flow: column;
                grid-auto-columns: 100%;
                grid-auto-rows: 100%;
            }

            @media (max-width:480px){
                #leftPanel {
                    background-color: var(--background-color, rgb(255,255,255));
                    position: static;
                    width:100%;
                }
                #leftPanel.hidden {
                    margin-left: -100%;
                }
            }
        </style>
        <header>
            <app-bar id="header" caption="">
                <round-button slot="left" id="navigation" title="Menu" data-icon="menu"></round-button>
                <span id="appTitle" slot="middle">FHIR Browser</span>
                <span id="serverCode" slot="middle"></span>
                <color-scheme slot="right"></color-scheme>
                <round-button slot="right" id="serverDialogToggle" title="Connections" data-icon="public"></round-button>
            </app-bar>
        </header>
        <main>
            <div>
                <app-left-panel id="leftPanel">
                    <fhir-metadata id="metadata" hidden></fhir-metadata>
                </app-left-panel>
                <div id="bdy" style="visibility:hidden;">
                    <fhir-bundle id="bundle"></fhir-bundle>
                    <fhir-resource id="resource"></fhir-resource>
                </div>
            </div>
        </main>
        <app-dialog id="serverDialog" data-title="Connections" hidden>
            <fhir-server id="serverSelector"></fhir-server>
        </app-dialog>
    `;

    window.customElements.define('fhir-browser', FhirBrowser);
})();
