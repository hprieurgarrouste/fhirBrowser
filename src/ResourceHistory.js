import template from './templates/ResourceHistory.html'

import M2LinearProgress from './components/M2LinearProgress'
import M2List from './components/M2List'
import M2ListRow from './components/M2ListRow'
import M2ListItem from './components/M2ListItem'

import context from './services/Context'

export default class ResourceHistory extends HTMLElement {
    /** @type {M2List} */
    #list
    /** @type {M2LinearProgress} */
    #progress

    /** @Type {String} */
    #resourceType
    /** @Type {String} */
    #resourceId

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template

        shadow.getElementById('help').onclick = this.#helpClick

        this.#list = shadow.querySelector('m2-list')
        this.#list.onclick = this.#appListClick

        this.#progress = shadow.querySelector('m2-linear-progress')

        shadow.getElementById('close').onclick = this.#sidePanelClose

        this.#resourceType = null
        this.#resourceId = null
    }

    #appListClick = (event) => {
        event.preventDefault()
        event.stopPropagation()
        const item = event.target.closest('m2-list-row')
        if (item) {
            if (item.hasAttribute('selected')) return
            this.#list.querySelector('m2-list-row[selected]')?.removeAttribute('selected')
            item.setAttribute('selected', '')
            location.hash = `#/${this.#resourceType}/${this.#resourceId}/_history/${item.dataset.versionid}`
        } else {
            event.preventDefault()
            event.stopPropagation()
        }
    }

    #helpClick = (event) => {
        window.open(context.server.historyHelpUrl(), 'FhirBrowserHelp')
        event.preventDefault()
        event.stopPropagation()
    }

    #sidePanelClose = (event) => {
        this.hidden = true
        event.preventDefault()
        event.stopPropagation()
    }

    /**
     * @param {fhir4.CapabilityStatementRestResource} resourceType
     * @param {String} resourceId
     * @returns {void}
     */
    load (resourceType, resourceId) {
        if (!resourceType.interaction.find(({ code }) => code === 'vread')) return
        if (resourceType.type === this.#resourceType && resourceId === this.#resourceId) return

        this.#progress.hidden = false
        this.#list.clear()

        this.#readResource(resourceType.type, resourceId).then(resource => {
            this.#resourceType = resourceType.type
            this.#resourceId = resource.id
            const resourceVersionId = resource.meta?.versionId
            this.#readHistory(resourceType.type, resource.id).then(response => {
                if (response.resourceType === 'Bundle' && response.type === 'history' && response.total > 0) {
                    response.entry
                        .filter(element => element?.resource?.meta)
                        .sort((e1, e2) => {
                            const d1 = new Date(e1.resource.meta.lastUpdated)
                            const d2 = new Date(e2.resource.meta.lastUpdated)
                            return d2 - d1
                        }).forEach(element => {
                            const row = new M2ListRow()
                            row.setAttribute('data-versionid', element.resource.meta.versionId)
                            if (resourceVersionId === element.resource.meta.versionId) {
                                row.setAttribute('selected', '')
                            }
                            const date = new Date(element.resource.meta.lastUpdated)
                            const item = new M2ListItem()
                            item.setAttribute('data-icon', 'history')
                            item.setAttribute('data-primary', `${date.toLocaleString(undefined, {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            })}`)
                            item.setAttribute('data-secondary', `${date.toLocaleString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                timeZoneName: 'short'
                            })}`)
                            row.appendChild(item)
                            this.#list.appendChild(row)
                        })
                }
                this.#progress.hidden = true
            })
        })
    }

    #readResource = async (type, id) => {
        return await context.server.fetch(`/${type}/${id}`, {
            _format: 'json'
        })
    }

    #readHistory = async (type, id) => {
        return await context.server.fetch(`/${type}/${id}/_history`, {
            _format: 'json',
            _summary: 'text'
        })
    }
};

customElements.define('resource-history', ResourceHistory)
