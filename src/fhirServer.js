import "./appRoundButton.js"
import "./appListItem.js"
import { Preferences } from "./appPreferences.js";

customElements.define('fhir-server', class FhirServer extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(FhirServerTemplate.content.cloneNode(true));
    }
    connectedCallback() {
        const content = this._shadow.getElementById('content');
        this._shadow.getElementById('close').addEventListener("click", () => {
            this.hidden = true;
        });
        this._shadow.getElementById('wrapper').addEventListener("click", () => {
            this.hidden = true;
        });
        this._shadow.getElementById('surface').addEventListener("click", (event) => {
            event.stopPropagation();
        });
        content.addEventListener("click", ({ target }) => {
            const row = target.closest("app-list-item");
            if (row) {
                const prev = content.querySelector(".selected");
                if (prev) prev.classList.remove('selected');
                row.classList.add('selected');
                this.serverChanged(row.id);
                this.hidden = true;
            }
        });

        this.loadConf().then(conf => {
            this._conf = conf;
            const preferedServer = Preferences.get("server");
            const content = this._shadow.getElementById('content');
            for (const key of Object.keys(conf).sort()) {
                const row = document.createElement('app-list-item');
                row.setAttribute("id", key);
                if (key === preferedServer) row.classList.add("selected");
                const title = document.createElement("span");
                title.appendChild(document.createTextNode(key));
                title.slot = "title";
                row.appendChild(title);
                const subTitle = document.createElement("span");
                subTitle.appendChild(document.createTextNode(this._conf[key].url));
                subTitle.slot = "subTitle";
                row.appendChild(subTitle);
                content.appendChild(row);
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

        this.dispatchEvent(new CustomEvent("serverchanged", {
            bubbles: false,
            cancelable: false,
            "detail": {
                "serverCode": serverKey,
                "server": server
            }
        }));

        Preferences.set("server", serverKey);
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

const FhirServerTemplate = document.createElement('template');
FhirServerTemplate.innerHTML = `
    <link rel="stylesheet" href="./material.css">
    <style>
        #wrapper {
            position: absolute;
            top: 0;
            left:0;
            background-color: rgba(0,0,0,32%);
            min-height: 100%;
            min-width: 100%;
        }
        #surface {
            font-family: Roboto, Arial, monospace;
            background-color: var(--background-color, white);
            color:var(--text-color-normal, white);
            position: absolute;
            top: 60px;
            right: 1em;
            height: 50%;
            min-width: 20%;
            border-radius: 4px;
            background-color: var(--background-color, white);
            box-shadow: 0px 11px 15px -7px rgb(0 0 0 / 20%), 0px 24px 38px 3px rgb(0 0 0 / 14%), 0px 9px 46px 8px rgb(0 0 0 / 12%);
            display:flex;
            flex-direction: column;
        }
        app-bar {
            border-bottom: 1px solid var(--border-color);
        }
        #content {
            overflow:auto;
            flex: 1 1 auto;
            height: 0;
        }
        app-list-item {
            cursor: pointer;
        }
        app-list-item.selected {
            background-color: var(--hover-color, rgba(0, 0, 0, 5%));
        }
        #actions {
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
        @media (max-width:480px){
            #surface {
                top:0;
                left:0;
                height: 100%;
                width:100%;
                max-width: unset;
                max-height: unset;
            }
        }
    </style>
    <div id="wrapper">
        <div id="surface">
            <app-bar id="header">
                <app-round-button id="close" title="Close" app-icon="close" slot="left"></app-round-button>
                <h3 id="title" slot="title">Connections</h3>
            </app-bar>
            <div id="content"></div>
            <div id="actions">
                <input type="button" value="New connection"></input>
            <div>
        </div>
    </div>
`;
