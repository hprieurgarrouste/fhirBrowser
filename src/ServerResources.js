import template from "./templates/ServerResources.html";

import "./components/AppList"
import "./components/AppBadge"
import "./components/ListItem"
import "./components/ListRow"

import { FhirService } from "./services/Fhir.js"

class ServerResources extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._resourceType = null;
    }

    connectedCallback() {
        const list = this._shadow.querySelector('app-list');
        list.onFilter = this.appListFilter;
        list.onclick = this.appListClick;
        FhirService.addListener(this.serverChanged);
        window.addEventListener("hashchange", this.locationHandler);
    }

    locationHandler = () => {
        let hash = window.location.hash.replace('#/', '').trim();
        if (hash.length) {
            let resourceType = '';
            if (hash.indexOf('?') > 0) {
                resourceType = hash.split('?')[0];
            } else {
                resourceType = hash.split("/")[0];
            }
            this.value = resourceType;
        } else {
            this.value = null;
        }
    }

    serverChanged = () => {
        const list = this._shadow.querySelector('app-list');
        list.clear();
        const resource = FhirService.server?.capabilities?.rest[0]?.resource;
        resource
            .filter(res => res.interaction.map(interaction => interaction.code).includes('search-type'))
            .forEach(resource => {
                const row = document.createElement('list-row');
                row.setAttribute("data-type", resource.type);
                const item = document.createElement('list-item');
                item.setAttribute("data-primary", resource.type);
                item.setAttribute("data-icon", FhirService.ResourceIcon(resource.type));
                const count = makeTrailling(resource);
                if (count) item.appendChild(count);
                row.appendChild(item);
                list.appendChild(row);
            });
        this.locationHandler();

        function makeTrailling(resource) {
            const count = resource.extension
                ?.find(x => 'http://hl7api.sourceforge.net/hapi-fhir/res/extdefs.html#resourceCount' == x.url)
                ?.valueDecimal;
            if (count) {
                const badge = document.createElement('app-badge');
                badge.slot = 'trailling';
                badge.value = count;
                return badge;
            }
            return null;
        }
    }

    appListClick = ({ target }) => {
        const row = target.closest("list-row");
        if (row) {
            this._shadow.querySelector('app-list').querySelector("[selected]")?.removeAttribute("selected");
            row.setAttribute("selected", "");
            this._resourceType = row.dataset.type;
            location.hash = `#/${row.dataset.type}?_summary=true&_format=json&_count=20`;
        }
    }

    appListFilter = (value) => {
        const filter = value.toLowerCase();
        this._shadow.querySelector('app-list').childNodes.forEach(row => {
            row.hidden = !row.dataset.type.toLowerCase().includes(filter);
        });
    }

    get value() {
        return this._resourceType;
    }

    set value(resourceType) {
        const list = this._shadow.querySelector('app-list');
        if (!resourceType) {
            list.querySelector("[selected]")?.removeAttribute("selected");
            list.scrollTop = 0;
            return;
        }
        if (resourceType != this._resourceType) {
            const row = Array.from(list.childNodes).find(r => r.dataset.type === resourceType);
            if (row) {
                this._resourceType = resourceType;
                list.querySelector("[selected]")?.removeAttribute("selected");
                row.setAttribute("selected", "");
                row.scrollIntoView();
            }
        }
    }

};

customElements.define('server-resources', ServerResources)
