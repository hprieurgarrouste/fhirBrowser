import template from "./templates/ServerResources.html"

import resourceIcon from "./assets/fhirIconSet"

import "./components/M2List"
import "./components/M2Badge"
import "./components/M2ListItem"
import "./components/M2ListRow"

import context from "./services/Context"

class ServerResources extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this._list = shadow.querySelector('m2-list');
        this._list.onFilter = this.appListFilter;
        this._list.onclick = this.appListClick;

        this._recent = new Set();
    }

    /**
     * @param {object} capabilityStatement
     */
    load = (capabilityStatement) => {
        this._list.clear();
        this._recent.clear();
        capabilityStatement?.rest[0]?.resource
            .filter(res => res.interaction.map(interaction => interaction.code).includes('search-type'))
            .forEach(resource => {
                const item = document.createElement('m2-list-item');
                item.setAttribute("data-primary", resource.type);
                item.setAttribute("data-icon", resourceIcon[resource.type.toLowerCase()]);
                const row = document.createElement('m2-list-row');
                row.setAttribute("data-type", resource.type);
                row.appendChild(item);
                this._list.appendChild(row);
            });
    }

    /**
     * @param {event} event
     */
    appListClick = ({ target }) => {
        const row = target.closest("m2-list-row");
        if (row) {
            this._list.querySelector('m2-list-row[selected]')?.removeAttribute('selected');
            row.setAttribute('selected', '');
            location.hash = `#/${row.dataset.type}?_summary=true&_format=json`;
        }
    }

    /**
     * @param {string} value
     */
    appListFilter = (value) => {
        this._list.childNodes.forEach(row => row.hidden = !row.dataset.type.toLowerCase().includes(value.toLowerCase()));
        this._list.querySelector("m2-list-row[selected]")?.scrollIntoView();
    }

    /**
     * @returns {(string|null)}
     */
    get value() {
        return this._list.querySelector("m2-list-row[selected]").dataset.type;
    }

    /**
     * @param {string} resourceType
     */
    set value(resourceType) {
        this.selectRow(this._list.querySelector(`m2-list-row[data-type="${resourceType}"]`));
    }

    /**
     * @param {ListRow} row
     */
    selectRow = (row) => {
        const currentRow = this._list.querySelector('m2-list-row[selected]');
        //unselect
        if ('m2-list-row' != row?.localName) {
            currentRow?.removeAttribute('selected');
            this._list.scrollTop = 0;
            return;
        }
        //select
        if (row != currentRow) {
            currentRow?.removeAttribute('selected');
            row.setAttribute('selected', '');
            row.scrollIntoView();
        }
        //add badge
        const item = row.querySelector('m2-list-item');
        if (!item.querySelector('m2-badge[slot="trailling"]')) {
            this.getCount(row.dataset.type).then(({ total }) => {
                //TODO avoid double badge
                if (!item.querySelector('m2-badge[slot="trailling"]')) {
                    item.appendChild(this.makeBadge(total))
                }
            });
        }
        //recent
        this._recent.add(row.dataset.type);
        if (this._recent.size > 10) this._recent.delete(this._recent.values().next().value);
        //console.log(this._recent);
    }

    /**
     * @param {string} resourceType
     * @returns {promise} response of count fetch
     */
    getCount = async (resourceType) => {
        const url = new URL(`${context.server.url}/${resourceType}`);
        url.searchParams.set("_summary", "count");
        url.searchParams.set("_format", "json");
        const response = await fetch(url, {
            "headers": context.server.headers
        });
        return response.json();
    }

    /**
     * @param {number} count
     * @returns {AppBadge} Badge component
     */
    makeBadge = (count) => {
        const badge = document.createElement('m2-badge');
        badge.slot = 'trailling';
        badge.value = count == undefined ? '?' : count;
        return badge;
    }

};

customElements.define('server-resources', ServerResources)
