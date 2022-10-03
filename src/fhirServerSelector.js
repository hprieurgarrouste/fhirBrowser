import { Preferences } from "./appPreferences.js";

customElements.define('fhir-server-selector', class FhirServerSelector extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(FhirServerSelectorTemplate.content.cloneNode(true));
        this._conf = null;
        this._server = this._shadow.getElementById("server");
    }

    connectedCallback() {
        this.loadConf().then(conf => {
            this._conf = conf;
            for (const key of Object.keys(conf).sort()) {
                const opt = document.createElement('OPTION');
                opt.setAttribute("value", key);
                opt.appendChild(document.createTextNode(key));
                this._server.appendChild(opt);
            }
            const preferedServer = Preferences.get("server");
            if (preferedServer != null) {
                this._server.value = preferedServer;
                this.serverChanged();
            }
        });
        this._server.addEventListener("change", () => {
            this.serverChanged();
        });
    }

    serverChanged() {
        const server = this._conf[this._server.value];
        this._shadow.getElementById("server-url").innerText = server.url;
        this.connect(server);

        this.dispatchEvent(new CustomEvent("serverchanged", {
            bubbles: false,
            cancelable: false,
            "detail": {
                "server": server
            }
        }));

        Preferences.set("server", this._server.value);
    }

    connect(server) {
        if (server.auth) {
            switch (server.auth.method) {
                case "oauth2":
                    this.oauth2_getToken(server.auth.setup).then(response => {
                        server.headers.Authorization = `${response.token_type} ${response.access_token}`;
                    });
                    break;
                case "basic":
                    let auth = btoa(`${server.auth.setup.username}:${server.auth.setup.password}`);
                    server.headers.Authorization = `Basic ${auth}`;
                    break;
                default:
                    break;
            }
        }
    }

    async oauth2_getToken(setup) {
        let urlParams = {
            "client_id": setup.client_id,
            "client_secret": setup.client_secret,
            "grant_type": setup.grant_type,
            "username": setup.username,
            "password": setup.password
        }
        let result = new URLSearchParams(urlParams);
        const response = await fetch(setup.access_token_url, {
            "headers": {
                "Content-type": "application/x-www-form-urlencoded"
            },
            "method": "POST",
            "body": result.toString()
        });
        return response.json();
    }

    async loadConf() {
        let conf = localStorage.getItem('conf');
        if (conf === null) {
            return await fetch(`./default.conf`, { "cache": "reload" })
                .then(response => response.json())
                .then(conf => {
                    localStorage.setItem('conf', JSON.stringify(conf));
                    return conf;
                });
        } else {
            return JSON.parse(conf);
        }
    }

});

const FhirServerSelectorTemplate = document.createElement('template');
FhirServerSelectorTemplate.innerHTML = `
    <link href="./material.css" rel="stylesheet"/>
    <style>
        #wrapper {
            padding:25px;
        }
        #server {
            background-color: var(--background-color, white);
            border: 1px solid var(--border-color, rgba(0,0,0,38%));
            border-radius: 4px;
            color: var(--text-color-normal, rgb(0,0,0,87%));
            font-family: inherit;
            font-size: 1em;
            padding: 8px 5px 5px 5px;
            width: 100%;
        }
        #server:hover {
            border-color: var(--border-color, rgba(0,0,0,38%));
        }
        #server:active {
            outline-style: auto;
            outline-color: var(--primary-color, black);
        }
        #server:focus-visible {
            outline-color: var(--primary-color, black);
        }
        #server-wrapper {
            position:relative;
        }
        #server-label {
            position: absolute;
            top: -0.8em;
            left: 0.5em;
            background-color: var(--background-color, white);
            font-size: 0.7em;
            font-family: inherit;
            padding: 0 5px;"
        }
        #server-url {
            overflow-wrap: break-word;
            color: var(--text-color-disabled);
            font-size: 0.9em;
            margin-top: 0.5em;
        }
    </style>
    <div id="wrapper">
        <div id="server-wrapper">
            <label id="server-label">FHIR server</label>
            <select id="server"><option hidden selected>Select a server</option></select>
        </div>
        <div id="server-url"></div>
    </div>
`;