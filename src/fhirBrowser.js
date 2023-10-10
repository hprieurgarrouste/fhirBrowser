import template from "./templates/fhirBrowser.html";

import "./components/AppBar.js";
import "./components/AppDialog.js";
import "./components/ColorScheme.js";
import "./appLeftPanel.js";
import "./fhirBrowserAbout.js";
import "./fhirBundle.js";
import "./fhirMetadata.js";
import "./fhirResource.js";
import "./fhirServerList.js";
import "./fhirServerForm.js";
import { FhirService } from "./services/Fhir.js";
import { PreferencesService } from "./services/Preferences.js";
import { SettingsService } from "./services/Settings.js";
import { SnackbarsService } from "./services/Snackbars.js";

/* Only register a service worker if it's supported */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js');
}

class FhirBrowser extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        window.addEventListener("hashchange", this.locationHandler);
    }

    showResource(resourceType, id) {
        const metadata = this._shadow.getElementById("metadata");
        metadata.select(resourceType.type);
        const bundle = this._shadow.getElementById("bundle");
        bundle.hidden = true;
        const resource = this._shadow.getElementById("resource");
        resource.load({
            "resourceType": resourceType,
            "resourceId": id
        });
    }
    showBundle(resourceType, search) {
        const bdy = this._shadow.getElementById("bdy");
        bdy.style.visibility = "visible";
        if (window.matchMedia("(max-width: 480px)").matches) {
            this._shadow.getElementById("leftPanel").classList.add("hidden");
        }
        const bundle = this._shadow.getElementById("bundle");
        bundle.hidden = false;
        const metadata = this._shadow.getElementById("metadata");
        metadata.select(resourceType.type);
        bundle.load(resourceType, search);
    }

    locationHandler = async () => {
        let hash = window.location.hash.replace('#', '').trim();
        if (hash.length) {
            let id = '';
            let resourceName = '';
            let queryParams = [];
            if (hash.indexOf('?') > 0) {
                resourceName = hash.split('?')[0];
                queryParams = hash.slice(hash.indexOf(`?`) + 1).split(`&`).map(p => {
                    const [key, val] = p.split(`=`)
                    return {
                        name: key,
                        value: decodeURIComponent(val)
                    }
                });
            } else {
                const hashparts = hash.split("/");
                resourceName = hashparts[0];
                id = hashparts[1] || '';
            }
            const resourceType = FhirService.server.capabilities.rest[0].resource.filter(res => res.type === resourceName)[0];
            if (!resourceType) {
                SnackbarsService.show(`Resource "${resourceType}" not found!`);
                return;
            }
            if (id) {
                this.showResource(resourceType, id);
            } else {
                this.showBundle(resourceType, queryParams);
            }
        }
    }

    connectedCallback() {
        SnackbarsService.container = this._shadow;

        this._shadow.getElementById("navigation").addEventListener('click', () => {
            this._shadow.getElementById("leftPanel").classList.toggle("hidden");
        });

        this._shadow.getElementById("serverSelector").addEventListener('serverchanged', ({ detail }) => {
            this.connect(detail.serverCode, detail.server);
        });

        this._shadow.getElementById('aboutDialogToggle').addEventListener("click", () => {
            this._shadow.getElementById('aboutDialog').hidden = false;
        });

        this._shadow.getElementById('serverDialogToggle').addEventListener("click", () => {
            this._shadow.getElementById('serverDialog').hidden = false;
        });

        this._shadow.getElementById('serverSelector').addEventListener("serverNew", () => {
            this._shadow.getElementById('serverDialog').hidden = true;
            this._shadow.getElementById('serverNewDialog').hidden = false;
        });

        /*this._shadow.getElementById('serverNewToggle').addEventListener("click", () => {
            this._shadow.getElementById('serverNewDialog').hidden = false;
        });*/

        const preferedServer = PreferencesService.get("server");
        if (preferedServer) {
            SettingsService.get(preferedServer).then((server) => {
                this.connect(preferedServer, server);
            });
        } else {
            this._shadow.getElementById('serverDialog').hidden = false;
        }
    }

    connect(serverCode, server) {
        FhirService.connect(serverCode, server).then(() => {
            PreferencesService.set("server", serverCode);
            this._shadow.getElementById("serverDialog").hidden = true;
            this._shadow.getElementById("bdy").style.visibility = "hidden";
            this._shadow.getElementById("leftPanel").classList.add("hidden");
            this._shadow.getElementById("navigation").hidden = true;
            SnackbarsService.show(`Connected to "${serverCode}" server.`);
            this._shadow.getElementById("metadata").server = FhirService.server;
            this._shadow.getElementById("leftPanel").classList.remove("hidden");
            this._shadow.getElementById("navigation").hidden = false;
            location.hash = "";
        }).catch(error => {
            SnackbarsService.show(`An error occurred while connecting to the server "${serverCode}"`,
                undefined,
                undefined,
                'error'
            );
        });
    }

};
customElements.define('fhir-browser', FhirBrowser);

