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

import { Server } from "./Server";
import { ServerConfiguration } from "./ServerConfiguration";

/* Only register a service worker if it's supported */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js');
}

class App extends HTMLElement {
    /**
     * @type Server
     */
    _server = null;

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this._shadow = shadow;

        this._serverPanel = shadow.querySelector('server-panel');
        this._body = shadow.getElementById("bdy");

        this._navigationToggle = shadow.getElementById('navigation');
        this._navigationToggle.onclick = () => this._serverPanel.classList.toggle('hidden');

        this._waiting = shadow.getElementById('waiting');

        this._serverDialog = shadow.querySelector('server-dialog');
        this._serverDialog.onSelect = this.connect;

        shadow.getElementById('serverDialogToggle').onclick = () => {
            this._serverDialog.value = this._server.serverCode;
            this._serverDialog.hidden = false;
        }

        shadow.getElementById('aboutDialogToggle').onclick = this.aboutDialogToggleClick;

        this._bundleView = shadow.querySelector("fhir-bundle");
        this._resourceView = shadow.querySelector("fhir-resource");
        this._operationOutcomeView = shadow.querySelector("fhir-operation-outcome");
    }

    aboutDialogToggleClick = () => {
        let aboutDialog = this._shadow.querySelector('about-dialog');
        if (aboutDialog) {
            aboutDialog.hidden = false;
        } else {
            aboutDialog = document.createElement('about-dialog');
            this._shadow.appendChild(aboutDialog);
        }
    }

    fetchHash = async (hash) => {
        SnackbarsService.clear();
        const url = new URL(`${this._server.url}${hash}`);
        const timeoutId = setTimeout(() => {
            this._waiting.style.visibility = 'visible';
        }, 500);

        try {
            const response = await fetch(url, {
                "headers": this._server.headers
            });
            if (!response.ok) {
                SnackbarsService.error(`${response.status} ${response.statusText}`);
            }
            this._body.style.visibility = "visible";
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
                    this._resourceView.hidden = true;
                    this._operationOutcomeView.hidden = true;
                    this._bundleView.source = source;
                    this._serverPanel.value = this._bundleView.resourceType.type;
                } else {
                    this._bundleView.hidden = true;
                    this._resourceView.hidden = false;
                    this._operationOutcomeView.hidden = true;
                    this._resourceView.source = source;
                    this._serverPanel.value = this._resourceView.resourceType.type;
                }
            } else {
                throw new Error('Unknown response format');
            }
        } catch (error) {
            SnackbarsService.show(error, undefined, undefined, 'error');
        } finally {
            clearTimeout(timeoutId);
            this._waiting.style.visibility = 'hidden'
        }
    }

    locationHandler = () => {
        let hash = window.location.hash.replace('#', '').trim();
        if (hash.length) {
            if (window.matchMedia("(max-width: 480px)").matches) {
                this._serverPanel.classList.add("hidden");
            }
            this.fetchHash(hash);
        } else {
            this._body.style.visibility = "hidden";
            this._serverPanel.classList.remove("hidden");
        }
    }

    get container() {
        return this._shadow;
    }

    connectedCallback() {
        window.addEventListener("hashchange", this.locationHandler);

        const preferedServer = PreferencesService.get("server");
        if (preferedServer) {
            SettingsService.get(preferedServer).then((configuration) => {
                this.connect({
                    "code": preferedServer,
                    "configuration": configuration
                });
            });
        } else {
            this._serverDialog.hidden = false;
        }
    }

    connect = ({ code, configuration }) => {
        this._waiting.style.visibility = 'visible';
        const serverConfiguration = new ServerConfiguration(configuration);
        const server = new Server(code, serverConfiguration);
        server.connect().then(() => {
            this._server = server;
            FhirService.server = this._server;
            SnackbarsService.show(`Connected to "${code}" server.`);
            PreferencesService.set("server", code);
            this._navigationToggle.hidden = false;
            if (location.hash) {
                location.hash = '';
            } else {
                this.locationHandler();
            }
        }).catch(error => {
            SnackbarsService.error(`An error occurred while connecting to the server "${code}"`);
            console.log(error);
        }).finally(() => {
            this._waiting.style.visibility = 'hidden';
        });
    }

};
customElements.define('fhir-browser', App);

