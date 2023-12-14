import template from "./templates/fhirBrowser.html";

import "./components/AppBar"
import "./components/AppDialog"
import "./components/ColorScheme"
import "./components/CircularProgress"

import "./AppLeftPanel"
import "./FhirBrowserAbout"
import "./FhirBundle"
import "./FhirMetadata"
import "./FhirResource"
import "./FhirServerDialog"

import { FhirService } from "./services/Fhir"
import { PreferencesService } from "./services/Preferences"
import { SettingsService } from "./services/Settings"
import { SnackbarsService } from "./services/Snackbars"

/* Only register a service worker if it's supported */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js');
}

class FhirBrowser extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }

    showResource(resourceType, id) {
        const bdy = this._shadow.getElementById("bdy");
        bdy.style.visibility = "visible";
        if (window.matchMedia("(max-width: 480px)").matches) {
            this._shadow.getElementById("leftPanel").classList.add("hidden");
        }
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
        bundle.load(resourceType, search);
    }

    locationHandler = () => {
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
                id = hash.slice(resourceName.length + 1) || '';
            }
            const resourceType = FhirService.server.capabilities.rest[0].resource.find(res => res.type === resourceName);
            if (!resourceType) {
                SnackbarsService.show(`Resource "${resourceType}" not found!`);
                return;
            }
            if (id) {
                this.showResource(resourceType, id);
            } else {
                this.showBundle(resourceType, queryParams);
            }
        } else {
            this._shadow.getElementById("bdy").style.visibility = "hidden";
        }
    }

    connectedCallback() {
        window.addEventListener("hashchange", this.locationHandler);
        SnackbarsService.container = this._shadow;


        this._shadow.getElementById("navigation").addEventListener('click', () => {
            this._shadow.getElementById("leftPanel").classList.toggle("hidden");
        });

        this._shadow.getElementById('serverDialogToggle').addEventListener("click", () => {
            const dlg = this._shadow.querySelector('fhir-server-dialog');
            dlg.hidden = !dlg.hidden;
        });
        this._shadow.querySelector("fhir-server-dialog").addEventListener('serverchanged', ({ detail }) => {
            location.hash = ``;
            this.connect(detail.serverCode, detail.server);
        });

        this._shadow.getElementById('aboutDialogToggle').addEventListener("click", () => {
            this._shadow.getElementById('aboutDialog').hidden = false;
        });

        this._shadow.getElementById("aboutClose").onclick = () => {
            this._shadow.getElementById('aboutDialog').hidden = true;
        };

        const preferedServer = PreferencesService.get("server");
        if (preferedServer) {
            SettingsService.get(preferedServer).then((server) => {
                this.connect(preferedServer, server);
            });
        } else {
            this._shadow.querySelector('fhir-server-dialog').hidden = false;
        }
    }

    connect(serverCode, server) {
        const waiting = this._shadow.getElementById('waiting');
        waiting.style.visibility = 'visible';
        FhirService.connect(serverCode, server).then(() => {
            SnackbarsService.show(`Connected to "${serverCode}" server.`);
            PreferencesService.set("server", serverCode);
            this._shadow.getElementById("bdy").style.visibility = "hidden";
            this._shadow.getElementById("leftPanel").classList.remove("hidden");
            this._shadow.getElementById("navigation").hidden = false;
            this._shadow.querySelector('fhir-server-dialog').value = serverCode;
            this.locationHandler();
        }).catch(error => {
            SnackbarsService.show(`An error occurred while connecting to the server "${serverCode}"`,
                undefined,
                undefined,
                'error'
            );
        }).finally(() => {
            waiting.style.visibility = 'hidden';
        });
    }

};
customElements.define('fhir-browser', FhirBrowser);

