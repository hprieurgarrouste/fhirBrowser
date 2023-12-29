import template from "./templates/App.html";

import "./components/AppBar"
import "./components/AppDialog"
import "./components/ColorScheme"
import "./components/CircularProgress"

import "./AboutDialog"
import "./Bundle"
import "./ServerPanel"
import "./Resource"
import "./ServerDialog"
import "./OperationOutcome"

import { FhirService } from "./services/Fhir"
import { PreferencesService } from "./services/Preferences"
import { SettingsService } from "./services/Settings"
import { SnackbarsService } from "./services/Snackbars"

/* Only register a service worker if it's supported */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js');
}

class App extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;

        this._shadow.getElementById("navigation").onclick = () => {
            this._shadow.querySelector("server-panel").classList.toggle("hidden");
        };

        this._shadow.getElementById('serverDialogToggle').onclick = () => {
            this._shadow.querySelector('server-dialog').hidden = false;
        };

        this._shadow.querySelector("server-dialog").addEventListener('serverchanged', ({ detail }) => {
            this.connect(detail.serverCode, detail.server);
        });

        this._shadow.getElementById('aboutDialogToggle').onclick = () => {
            this._shadow.querySelector('about-dialog').hidden = false;
        };

        this._bundleView = this._shadow.querySelector("fhir-bundle");
        this._resourceView = this._shadow.querySelector("fhir-resource");
        this._operationOutcomeView = this._shadow.querySelector("fhir-operation-outcome");
    }

    async fetchHash(hash) {
        const url = new URL(`${FhirService.server.url}${hash}`);
        const timeoutId = setTimeout(() => {
            this._shadow.getElementById('waiting').style.visibility = 'visible';
        }, 500);

        try {
            const response = await fetch(url, {
                "headers": FhirService.server.headers
            });
            if (!response.ok) {
                //throw new Error(`${response.status} ${response.statusText}`);
                SnackbarsService.error(`${response.status} ${response.statusText}`);
            }
            const bdy = this._shadow.getElementById("bdy");
            bdy.style.visibility = "visible";
            const contentType = response.headers.get("Content-Type");
            let sourceType;
            let source;
            if (contentType.includes('json')) {
                source = await response.json();
                sourceType = source.resourceType;
            } else if (contentType.includes('xml')) {
                source = new DOMParser().parseFromString(await response.text(), "application/xml");
                sourceType = source.documentElement.nodeName;
            } else {
                source = await response.text();
                const match = source.match(/rdf:type\s+fhir:(\w+)/); //is TTL ?
                if (match) sourceType = match[1];
            }
            if (sourceType) {
                if ('OperationOutcome' == sourceType) {
                    this._bundleView.hidden = true;
                    this._resourceView.hidden = true;
                    this._operationOutcomeView.hidden = false;
                    this._operationOutcomeView.source = source;
                } else if ('Bundle' == sourceType) {
                    this._bundleView.hidden = false;
                    this._bundleView.source = source;
                    this._resourceView.hidden = true;
                    this._operationOutcomeView.hidden = true;
                } else {
                    this._bundleView.hidden = true;
                    this._resourceView.hidden = false;
                    this._resourceView.source = source;
                    this._operationOutcomeView.hidden = true;
                }
            } else {
                throw new Error('Unknown response format');
            }
        } catch (error) {
            SnackbarsService.show(error, undefined, undefined, 'error');
        } finally {
            clearTimeout(timeoutId);
            this._shadow.getElementById('waiting').style.visibility = 'hidden'
        }
    }

    locationHandler = () => {
        let hash = window.location.hash.replace('#', '').trim();
        if (hash.length) {
            this.fetchHash(hash);
            if (window.matchMedia("(max-width: 480px)").matches) {
                this._shadow.querySelector("server-panel").classList.add("hidden");
            }
        } else {
            this._shadow.getElementById("bdy").style.visibility = "hidden";
            this._shadow.querySelector("server-panel").classList.remove("hidden");
        }
    }

    get container() {
        return this._shadow;
    }

    connectedCallback() {
        window.addEventListener("hashchange", this.locationHandler);
        SnackbarsService.container = this._shadow;

        const preferedServer = PreferencesService.get("server");
        if (preferedServer) {
            SettingsService.get(preferedServer).then((server) => {
                this.connect(preferedServer, server);
            });
        } else {
            this._shadow.querySelector('server-dialog').hidden = false;
        }
    }

    connect(serverCode, server) {
        const waiting = this._shadow.getElementById('waiting');
        waiting.style.visibility = 'visible';
        FhirService.connect(serverCode, server).then(() => {
            SnackbarsService.show(`Connected to "${serverCode}" server.`);
            PreferencesService.set("server", serverCode);
            this._shadow.getElementById("navigation").hidden = false;
            this._shadow.querySelector('server-dialog').value = serverCode;
            if (location.hash) {
                location.hash = '';
            } else {
                this.locationHandler();
            }
        }).catch(error => {
            SnackbarsService.error(`An error occurred while connecting to the server "${serverCode}"`);
            console.log(error);
        }).finally(() => {
            waiting.style.visibility = 'hidden';
        });
    }

};
customElements.define('fhir-browser', App);

