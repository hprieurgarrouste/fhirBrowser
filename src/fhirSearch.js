import template from "./templates/fhirSearch.html";

import "./components/RoundButton.js"
import "./fhirSearchItem.js"

import { FhirService } from "./services/Fhir.js";

class FhirSearch extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }

    connectedCallback() {
        const content = this._shadow.querySelector("main");

        this._shadow.getElementById("back").addEventListener('click', (event) => {
            this.classList.add("hidden");
            event.preventDefault();
            event.stopPropagation();
        });

        this._shadow.getElementById("clear").addEventListener("click", (event) => {
            this.clear();
            event.preventDefault();
            event.stopPropagation();
        });

        this._shadow.getElementById('help').addEventListener('click', (event) => {
            window.open(FhirService.helpUrl("search"), "FhirBrowserHelp");
            event.preventDefault();
            event.stopPropagation();
        });

        this._shadow.getElementById("apply").addEventListener("click", (event) => {
            applyClick.call(this);
            event.preventDefault();
            event.stopPropagation();
        });

        content.addEventListener("keydown", (event) => {
            if ('Enter' === event.code || 'NumpadEnter' === event.code) {
                applyClick.call(this);
                event.preventDefault();
                event.stopPropagation();
            }
        });

        function applyClick() {
            if (window.matchMedia("(max-width: 480px)").matches) {
                this.classList.add("hidden");
            }
            const hash = [];
            const fields = content.querySelectorAll("fhir-search-item");
            fields.forEach(({ value }) => {
                if (value) {
                    hash.push(`${value.name}=${encodeURIComponent(value.value)}`);
                }
            });
            location.hash = `#${this._resourceType.type}` + ((hash.length) ? `?${hash.join('&')}` : '');
        }
    }

    clear() {
        const content = this._shadow.querySelector("main");
        const fields = content.querySelectorAll("fhir-search-item");
        fields.forEach(field => field.clear());
    }

    /**
     * @param {any} filters
     */
    set filters(filters) {
        const content = this._shadow.querySelector("main");
        const fields = content.querySelectorAll("fhir-search-item");
        this.clear();
        filters.forEach(filter => {
            const fieldName = filter.name.split(':')[0];
            fields.forEach(field => {
                if (field.name == fieldName) {
                    field.value = filter;
                }
            });
        });
    }

    /**
     * @param {any} metadata
     */
    set metadata(metadata) {
        const content = this._shadow.querySelector("main");
        this._resourceType = metadata;
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

}
customElements.define('fhir-search', FhirSearch);