import template from "./templates/BundleSearchPanel.html";

import "./components/RoundButton"

import "./BundleSearchItem"

import { FhirService } from "./services/Fhir"

class BundleSearchPanel extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        shadow.getElementById('close').onclick = this.sidePanelClose;

        shadow.getElementById("clear").onclick = this.clearClick;

        shadow.getElementById('help').onclick = this.helpClick;

        shadow.getElementById('apply').onclick = this.applyClick;

        this._main = shadow.querySelector('main');
        this._main.addEventListener('keydown', this.mainKeyDown);

        this._resourceType = null;
    }

    connectedCallback() {
        window.addEventListener("hashchange", this.locationHandler);
        this.locationHandler();
    }

    mainKeyDown = (event) => {
        if (['Enter', 'NumpadEnter'].includes(event.code)) {
            this.applyClick(event);
        }
    }

    applyClick = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (window.matchMedia("(max-width: 480px)").matches) {
            this.classList.add("hidden");
        }
        const hash = [];
        const fields = this._main.querySelectorAll("bundle-search-item");
        fields.forEach(({ value }) => {
            if (value) {
                hash.push(`${value.name}=${encodeURIComponent(value.value)}`);
            }
        });
        location.hash = `#/${this._resourceType.type}?${hash.length ? hash.join('&') + '&' : ''}_summary=true&_format=json`;
    }

    helpClick = (event) => {
        window.open(FhirService.helpUrl("search"), "FhirBrowserHelp");
        event.preventDefault();
        event.stopPropagation();
    }

    clearClick = (event) => {
        this.clear();
        event.preventDefault();
        event.stopPropagation();
    }

    sidePanelClose = (event) => {
        this.classList.add('hidden');
        event.preventDefault();
        event.stopPropagation();
    }

    locationHandler = async () => {
        let hash = window.location.hash.replace('#/', '').trim();
        if (!hash || hash.indexOf('/') > 0) return;
        const resourceName = hash.split('?')[0];
        if (!resourceName) return;
        //TODO: refactor it's ugly
        while (!FhirService.server) {
            await delay(1000);
        }
        const resourceType = FhirService.server.capabilities.rest[0].resource.find(res => res.type === resourceName);
        if (resourceType) {
            if (resourceType.type !== this._resourceType?.type) {
                this._resourceType = resourceType;
                this.metadata = resourceType;
            }
            this.clear();

            const searchParams = new URLSearchParams(hash.replace(/^[^?]+\?/, ''));
            Array.from(searchParams).forEach(([name, value]) => {
                const fieldName = name.split(':')[0];
                const field = this._main.querySelector(`bundle-search-item[data-name="${fieldName}"`);
                if (field) field.value = {
                    'name': name,
                    'value': value
                }
            });
        }

        function delay(milliseconds) {
            return new Promise(resolve => {
                setTimeout(resolve, milliseconds);
            });
        }
    }

    clear() {
        const fields = this._main.querySelectorAll("bundle-search-item");
        fields.forEach(field => field.clear());
    }

    /**
     * @param {any} resourceType
     */
    set metadata(resourceType) {
        this._main.scrollTop = 0;
        while (this._main.firstChild) this._main.removeChild(this._main.lastChild);
        resourceType?.searchParam
            .sort((s1, s2) => s1.name.localeCompare(s2.name))
            .forEach(search => {
                const item = document.createElement("bundle-search-item");
                if (item.init(search)) {
                    item.setAttribute('data-name', search.name);
                    this._main.appendChild(item);
                }
            });

    }

}
customElements.define('bundle-search-panel', BundleSearchPanel);