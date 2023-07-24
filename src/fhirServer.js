import "./components/RoundButton.js"
import "./components/ListRow.js"
import "./components/ListItem.js"
import { PreferencesService } from "./services/Preferences.js";
import { FhirService } from "./services/Fhir.js";

(function () {
    class FhirServer extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
        }
        connectedCallback() {
            const nav = this._shadow.getElementById('content');
            nav.addEventListener("click", ({ target }) => {
                const row = target.closest("list-row");
                if (row) {
                    nav.querySelector("[selected]")?.removeAttribute("selected");
                    row.setAttribute("selected", "true");
                    this.serverChanged(row.dataset.id);
                }
            });

            this.loadConf().then(conf => {
                this._conf = conf;
                const preferedServer = PreferencesService.get("server");
                const nav = this._shadow.getElementById('content');
                for (const key of Object.keys(conf).sort((k1, k2) => k1.localeCompare(k2))) {
                    const row = document.createElement('list-row');
                    row.setAttribute("data-id", key);
                    if (key === preferedServer) row.setAttribute("selected", "true");
                    const item = document.createElement('list-item');
                    item.setAttribute("data-primary", key);
                    item.setAttribute("data-secondary", this._conf[key].url);
                    row.appendChild(item);
                    nav.appendChild(row);
                }
                if (preferedServer != null) {
                    this.serverChanged(preferedServer);
                } else {
                    this.hidden = false;
                }
            });
        }

        serverChanged(serverKey) {
            const server = this._conf[serverKey];
            this.connect(server);
            FhirService.server = server;
            this.dispatchEvent(new CustomEvent("serverchanged", {
                bubbles: false,
                cancelable: false,
                "detail": {
                    "serverCode": serverKey,
                    "server": server
                }
            }));

            PreferencesService.set("server", serverKey);
        }

        connect(server) {
            if (server.auth) {
                switch (server.auth.method) {
                    case "oauth2":
                        this.oauth2_getToken(server.auth.setup).then(response => {
                            if (!server.headers) server.headers = {};
                            server.headers.Authorization = `${response.token_type} ${response.access_token}`;
                        });
                        break;
                    case "basic":
                        let auth = btoa(`${server.auth.setup.username}:${server.auth.setup.password}`);
                        if (!server.headers) server.headers = {};
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
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link rel="stylesheet" href="./assets/material.css">
        <style>
            main {
                display:flex;
                flex-direction: column;
                height: 100%;
            }
            #content {
                overflow: auto;
                flex: 1 1 auto;
                height: 0;
            }
            #content > * {
                cursor: pointer;
            }
            #actions {
                border-top: 1px solid var(--border-color);
                padding: 0.5em 1em;
                text-align: center;
                overflow: hidden;
            }
            #actions input[type=button] {
                background: none;
                border: 1px solid var(--primary-color);
                border-radius: 4px;
                color: var(--primary-color);
                cursor: pointer;
                font: inherit;
                padding: 5px 16px;
                text-transform: uppercase;
            }
            #actions input[type=button]:hover {
                background-color: var(--hover-color);
            }
        </style>
        <main>
            <section id="content"></section>
            <section id="actions">
                <input type="button" value="New connection"></input>
            <section>
        </main>
    `;

    window.customElements.define('fhir-server', FhirServer);
})();