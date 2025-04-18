import template from './templates/ServerResources.html'

import resourceIcon from '../assets/fhirIconSet'

import '../components/M2List'
import M2Badge from '../components/M2Badge'
import M2ListItem from '../components/M2ListItem'
import M2ListRow from '../components/M2ListRow'

import context from '../services/Context'
import FavoritesService from '../services/Favorites'

export default class ServerResources extends HTMLElement {
    /** @type {M2List} */
    #list

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template

        this.#list = shadow.querySelector('m2-list')
        this.#list.onFilter = this.#appListFilter
        this.#list.onclick = this.#appListClick
    }

    /**
     * @param {fhir4.CapabilityStatement} capabilityStatement
     * @returns {void}
     */
    load = (capabilityStatement) => {
        this.#list.clear()
        const favorites = FavoritesService.favorites
        if (favorites.length !== 0) {
            let span = document.createElement('span')
            span.inert = true
            span.innerText = 'Favorites'
            this.#list.append(span)

            this.#list.append(...favorites
                .sort((r1, r2) => r1.localeCompare(r2, undefined, { sensitivity: 'base' }))
                .map(res => this.#makeListRow(res)))

            const divider = document.createElement('hr')
            divider.inert = true
            this.#list.append(divider)

            span = document.createElement('span')
            span.inert = true
            span.innerText = 'Other resources'
            this.#list.append(span)
        }
        this.#list.append(...capabilityStatement.rest[0].resource
            .filter(res => res.interaction?.some(({ code }) => code === 'search-type'))
            .filter(res => !favorites.includes(res.type))
            .sort((r1, r2) => r1.type.localeCompare(r2.type, undefined, { sensitivity: 'base' }))
            .map(r => this.#makeListRow(r.type))
        )
    }

    /**
     * @returns {(String|null)}
     */
    get value () {
        return this.#list.querySelector('m2-list-row[selected]').dataset.type
    }

    /**
     * @param {String} resourceType
     */
    set value (resourceType) {
        this.#selectRow(this.#list.querySelector(`m2-list-row[data-type="${resourceType}"]`))
    }

    /**
     * @param {String} resourceType
     * @returns {M2ListRow}
     */
    #makeListRow = (resourceType) => {
        const row = new M2ListRow()
        row.setAttribute('data-type', resourceType)
        row.append(new M2ListItem(resourceIcon[resourceType.toLowerCase()] || 'unknown_med', resourceType))
        return row
    }

    /**
     * @param {event} event
     */
    #appListClick = ({ target }) => {
        const row = target.closest('m2-list-row')
        if (row) {
            this.#list.querySelector('m2-list-row[selected]')?.removeAttribute('selected')
            row.setAttribute('selected', '')
            location.hash = `#/${row.dataset.type}?_summary=true&_format=json&_sort=-_lastUpdated`
        }
    }

    /**
     * @param {string} value
     */
    #appListFilter = (value) => {
        this.#list.querySelectorAll('m2-list-row').forEach(row => { row.hidden = !row.dataset.type.toLowerCase().includes(value.toLowerCase()) })
        this.#list.querySelector('m2-list-row[selected]')?.scrollIntoView()
    }

    /**
     * @param {M2ListRow} row
     */
    #selectRow = (row) => {
        const currentRow = this.#list.querySelector('m2-list-row[selected]')
        // unselect
        if (row?.localName !== 'm2-list-row') {
            currentRow?.removeAttribute('selected')
            this.#list.scrollTop = 0
            return
        }
        // select
        if (row !== currentRow) {
            currentRow?.removeAttribute('selected')
            row.setAttribute('selected', '')
            row.scrollIntoView()
        }
        // add badge
        const item = row.querySelector('m2-list-item')
        let badge = item.querySelector('m2-badge[slot="trailling"]')
        if (!badge) {
            badge = this.#makeBadge('...')
            item.append(badge)
            this.#getCount(row.dataset.type).then(({ total }) => { badge.value = total })
        }
    }

    /**
     * @param {string} resourceType
     * @returns {promise} response of count fetch
     */
    #getCount = async (resourceType) => {
        const url = new URL(`${context.server.url}/${resourceType}`)
        url.searchParams.set('_summary', 'count')
        url.searchParams.set('_format', 'json')
        const response = await fetch(url, {
            headers: context.server.headers
        })
        return response.json()
    }

    /**
     * @param {number} count
     * @returns {M2Badge} Badge component
     */
    #makeBadge = (count) => {
        const badge = new M2Badge()
        badge.slot = 'trailling'
        badge.value = (count === undefined) ? '?' : count
        return badge
    }
};

customElements.define('server-resources', ServerResources)
