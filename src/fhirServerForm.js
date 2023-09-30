import template from "./templates/fhirServerForm.html";

import "./components/TextField.js";
import "./fhirServerNewAuth.js";
import { FhirService } from "./services/Fhir.js";

(function () {
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
                const parameters = [];
                const fields = content.querySelectorAll("fhir-search-item");
                fields.forEach(field => {
                    let value = field.value;
                    if (value) {
                        parameters.push(value);
                    }
                });
                this.dispatchEvent(new CustomEvent("apply", {
                    bubbles: false,
                    cancelable: false,
                    "detail": {
                        "parameters": parameters
                    }
                }));
                event.preventDefault();
                event.stopPropagation();
            }

            this._shadow.getElementById("authMethod").addEventListener("change", ({ detail }) => {
                this._shadow.getElementById("apiKey").hidden = ("API Key" !== detail.value);
                this._shadow.getElementById("apiValue").hidden = ("API Key" !== detail.value);
                this._shadow.getElementById("basicUsername").hidden = ("Basic" !== detail.value);
                this._shadow.getElementById("basicPassword").hidden = ("Basic" !== detail.value);
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
})();
