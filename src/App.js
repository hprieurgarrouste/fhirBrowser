import template from "./templates/App.html"

import "./components/M2AppBar"
import "./components/M2Dialog"
import "./components/M2ColorScheme"
import "./components/M2CircularProgress"

import "./AboutDialog"
import "./Bundle"
import "./ServerPanel"
import "./Resource"
import "./ServerDialog"
import "./OperationOutcome"

import context from "./services/Context"
import preferencesService from "./services/Preferences"
import settingsService from "./services/Settings"
import snackbarService from "./services/Snackbar"

import Server from "./Server";
import ServerConfiguration from "./ServerConfiguration";

/* Only register a service worker if it's supported */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js');
}

class App extends HTMLElement {

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        context.appContainer = shadow;

        this._shadow = shadow;

        this._serverPanel = shadow.querySelector('server-panel');
        this._body = shadow.getElementById("bdy");

        this._navigationToggle = shadow.getElementById('navigation');
        this._navigationToggle.onclick = () => this._serverPanel.classList.toggle('hidden');

        this._waiting = shadow.getElementById('waiting');

        this._serverDialog = shadow.querySelector('server-dialog');
        this._serverDialog.onSelect = this.connect;

        shadow.getElementById('serverDialogToggle').onclick = () => {
            this._serverDialog.value = context.server.serverCode;
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
        snackbarService.clear();
        const url = new URL(`${context.server.url}${hash}`);
        const timeoutId = setTimeout(() => {
            this._waiting.style.visibility = 'visible';
        }, 500);

        try {
            const response = await fetch(url, {
                "headers": context.server.headers
            });
            if (!response.ok) {
                snackbarService.error(`${response.status} ${response.statusText}`);
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
            snackbarService.show(error, undefined, undefined, 'error');
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

    connectedCallback() {
        window.addEventListener("hashchange", this.locationHandler);

        const preferedServer = preferencesService.get("server");
        if (preferedServer) {
            settingsService.get(preferedServer).then((configuration) => {
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
            context.server = server;
            snackbarService.show(`Connected to "${code}" server.`);
            preferencesService.set("server", code);
            this._navigationToggle.hidden = false;
            if (location.hash) {
                location.hash = '';
            } else {
                this.locationHandler();
            }
        }).catch(error => {
            snackbarService.error(`An error occurred while connecting to the server "${code}"`);
            console.log(error);
        }).finally(() => {
            this._waiting.style.visibility = 'hidden';
        });
    }

};
customElements.define('fhir-browser', App);

