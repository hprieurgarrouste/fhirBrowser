import template from "./templates/ResourceReferences.html"

import resourceIcon from "./assets/fhirIconSet"

import M2List from "./components/M2List"
import M2ListItem from "./components/M2ListItem"
import M2ListRow from "./components/M2ListRow"

import context from "./services/Context"

export default class ResourceReferences extends HTMLElement {
    /** @type {M2List} */
    #list;
    /** @type {String} */
    #resourceId;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this.#list = shadow.querySelector('m2-list');
        this.#list.onclick = this.#appListClick;
        this.#list.onFilter = this.#appListFilter;

        shadow.getElementById('close').onclick = this.#sidePanelClose;

        this.#resourceId = null;
    }

    #appListClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const item = event.target.closest("m2-list-row");
        if (item) {
            location.hash = `#/${item.dataset.target}?${item.dataset.search}=${this.#resourceId}`;
        }
    }

    #appListFilter = (value) => {
        const filter = value.toLowerCase();
        this.#list.childNodes.forEach(row => {
            row.hidden = !(row.dataset.target.toLowerCase().includes(filter) || row.dataset.search.toLowerCase().includes(filter));
        });
    }

    #sidePanelClose = (event) => {
        this.hidden = true;
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * @param {any} resourceType
     * @param {String} resourceId
     * @returns {void}
     */
    load(resourceType, resourceId) {
        this.#resourceId = resourceId;

        this.#list.clear();

        const references = context.server.references(resourceType.type);
        if (references) {
            Object.entries(references).forEach(([key, value]) => {
                value.forEach(v => {
                    const item = new M2ListItem();
                    item.setAttribute("data-icon", resourceIcon[key.toLowerCase()]);
                    item.setAttribute("data-primary", `${key}.${v.name}`);
                    item.setAttribute("data-secondary", v.documentation.length > 100 ? `${v.documentation.substring(0, 100)}...` : v.documentation);
                    const row = new M2ListRow();
                    row.setAttribute("data-target", key);
                    row.setAttribute("data-search", v.name);
                    row.appendChild(item);
                    this.#list.appendChild(row);
                })
            });
        }
        return this.#list.children.length > 0;
    }

};

customElements.define('resource-references', ResourceReferences)
