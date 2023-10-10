import template from "./templates/fhirServerForm.html";

import "./components/TextField.js";
import "./fhirServerNewAuth.js";
import { FhirService } from "./services/Fhir.js";

class FhirServerForm extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }

    connectedCallback() {
        const content = this._shadow.querySelector("main");

        this._shadow.getElementById("apply").addEventListener("click", (event) => {
            applyClick.call(this, event);
        });

        content.addEventListener("keydown", (event) => {
            if ('Enter' === event.code || 'NumpadEnter' === event.code) {
                applyClick.call(this, event);
            }
        });

        function applyClick(event) {
            const method = this._shadow.getElementById("authMethod").value;
            let server = {
                url: this._shadow.getElementById("url").value,
                auth: {
                    method: method,
                    setup: {}
                }
            };
            switch (method) {
                case "API Key":
                    server.auth.setup.key = this._shadow.getElementById("apiKey").value;
                    server.auth.setup.value = this._shadow.getElementById("apiValue").value;
                    break;
                case "Basic":
                    server.auth.setup.username = this._shadow.getElementById("basicUsername").value;
                    server.auth.setup.password = this._shadow.getElementById("basicPassword").value;
                    break;
                case "OAuth 2":
                    server.auth.setup.access_token_url = this._shadow.getElementById("oauthTokenurl").value;
                    server.auth.setup.client_id = this._shadow.getElementById("oauthClientid").value;
                    server.auth.setup.client_secret = this._shadow.getElementById("oauthClientsecret").value;
                    server.auth.setup.grant_type = this._shadow.getElementById("oauthGranttype").value;
                    server.auth.setup.username = this._shadow.getElementById("oauthUsername").value;
                    server.auth.setup.password = this._shadow.getElementById("oauthPassword").value;
                    break;
                default:
                    break;
            }
            this.dispatchEvent(new CustomEvent("apply", {
                bubbles: false,
                cancelable: false,
                detail: {
                    key: this._shadow.getElementById("key").value,
                    server: server
                }
            }));
            event.preventDefault();
            event.stopPropagation();
        }

        this._shadow.getElementById("authMethod").addEventListener("change", ({ detail }) => {
            this._shadow.getElementById("apiSection").hidden = ("API Key" !== detail.value);
            this._shadow.getElementById("basicSection").hidden = ("Basic" !== detail.value);
            this._shadow.getElementById("oauthSection").hidden = ("OAuth 2" !== detail.value);
        });
    }

    /**
     * @param {any} metadata
     */
    set metadata(metadata) {
        const content = this._shadow.querySelector("main");
        content.scrollTop = 0;
        while (content.firstChild) content.removeChild(content.lastChild);
        if (metadata.searchParam) {
            const sorted = metadata.searchParam.sort((s1, s2) => s1.name < s2.name ? -1 : s1.name > s2.name ? 1 : 0);
            sorted.forEach(search => {
                const item = document.createElement("fhir-search-item");
                if (item.init(search)) {
                    content.appendChild(item);
                }
            });
        }
    }
};
customElements.define('fhir-server-form', FhirServerForm);
