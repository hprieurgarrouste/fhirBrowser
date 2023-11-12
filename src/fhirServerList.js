import template from "./templates/FhirServerList.html";

import "./components/RoundButton.js"
import "./components/ListRow.js"
import "./components/ListItem.js"
import { SettingsService } from "./services/Settings.js";
import { FhirService } from "./services/Fhir.js";

class FhirServerList extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
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

        SettingsService.getAll().then(conf => {
            this._conf = conf;
            const currentServer = FhirService.server?.serverCode;
            const nav = this._shadow.getElementById('content');
            for (const key of Object.keys(conf).sort((k1, k2) => k1.localeCompare(k2))) {
                const row = document.createElement('list-row');
                row.setAttribute("data-id", key);
                if (key === currentServer) row.setAttribute("selected", "true");
                const item = document.createElement('list-item');
                item.setAttribute("data-primary", key);
                item.setAttribute("data-secondary", this._conf[key].url);
                row.appendChild(item);
                nav.appendChild(row);
            }
        });
    }

    select(serverKey) {
        this._shadow.querySelector("list-row[selected]")?.removeAttribute("selected");
        const row = this._shadow.querySelector(`list-row[data-id="${serverKey}"]`);
        if (row) {
            row.setAttribute("selected", "true");
            row.scrollIntoView();
        }
    }

    serverChanged(serverKey) {
        const server = this._conf[serverKey];
        this.dispatchEvent(new CustomEvent("serverchanged", {
            bubbles: false,
            cancelable: false,
            "detail": {
                "serverCode": serverKey,
                "server": server
            }
        }));
    }
};
customElements.define('fhir-server-list', FhirServerList);
