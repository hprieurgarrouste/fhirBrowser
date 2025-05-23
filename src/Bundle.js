import favoriteService from './services/Favorites'

import template from './templates/Bundle.html'

import M2DataTable from './components/M2DataTable'
import M2RoundButton from './components/M2RoundButton'

import BundleColumnsDialog from './BundleColumnsDialog'
import BundleSearchPanel from './bundleSearch/BundleSearchPanel'

import context from './services/Context'
import preferencesService from './services/Preferences'
import snackbarService from './services/Snackbar'

export default class Bundle extends HTMLElement {
    /** @type {M2DataTable} */
    #table
    /** @type {M2RoundButton} */
    #settingsDialogToggle
    /** @type {BundleColumnsDialog} */
    #settingsDialog
    /** @type {String} */
    #title
    /** @type {Object.<String, M2RoundButton>} */
    #buttons = {}
    /** @type {HTMLSpanElement} */
    #total
    /** @type {M2RoundButton} */
    #searchToggle
    /** @type {BundleSearchPanel} */
    #searchPanel
    /** @type {Array.<String>} */
    #columns
    /** @type {M2RoundButton} */
    #favoriteToggle

    /** @type {String} */
    #resourceType
    /** @type {fhir4.Bundle} */
    #bundle

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#columns = []

        this.#title = shadow.getElementById('title')

        shadow.getElementById('help').onclick = this.#helpClick

        this.#total = shadow.getElementById('total')

        const pageFirst = shadow.getElementById('paginationFirst')
        pageFirst.onclick = this.#paginationClick

        const pagePrevious = shadow.getElementById('paginationPrevious')
        pagePrevious.onclick = this.#paginationClick

        const pageNext = shadow.getElementById('paginationNext')
        pageNext.onclick = this.#paginationClick

        const pageLast = shadow.getElementById('paginationLast')
        pageLast.onclick = this.#paginationClick

        this.#buttons = {
            first: pageFirst,
            previous: pagePrevious,
            prev: pagePrevious, // prev is specific to firely server
            next: pageNext,
            last: pageLast
        }

        this.#table = shadow.getElementById('table')
        this.#table.addEventListener('rowclick', this.#onRowClick)
        this.#table.onColumnReorder = this.#handleColumnChanged

        shadow.getElementById('copy').onclick = this.#copyClick
        shadow.getElementById('download').onclick = this.#downloadClick

        this.#settingsDialog = shadow.querySelector('bundle-columns-dialog')
        this.#settingsDialog.onValidate = this.#handleColumnSetup

        this.#settingsDialogToggle = shadow.getElementById('settingsDialogToggle')
        this.#settingsDialogToggle.onclick = this.#settingsDialogToggleClick

        this.#searchToggle = shadow.getElementById('searchToggle')
        this.#searchToggle.onclick = this.#searchToggleClick

        this.#searchPanel = shadow.getElementById('search')

        this.#favoriteToggle = shadow.getElementById('favorite-toggle')
        this.#favoriteToggle.onclick = this.#favoriteToggleClick
        favoriteService.addListener(this.#setFavoriteToggleStyle)
    }

    connectedCallback () {
        new MutationObserver(this.#searchHiddenObserver).observe(this.#searchPanel, { attributes: true })
    }

    #searchHiddenObserver = (mutationList) => {
        mutationList.forEach(({ type, attributeName, target }) => {
            if (type === 'attributes' && attributeName === 'class') {
                this.#searchToggle.hidden = !target.classList.contains('hidden')
            }
        })
    }

    #searchToggleClick = () => {
        this.#searchPanel.classList.toggle('hidden')
    }

    #onRowClick = ({ detail }) => {
        const entry = this.#bundle.entry.find(({ resource }) => resource.id === detail.resourceId)
        if (entry) {
            const url = entry.fullUrl.replace(`${context.server.url}`, '')
            location.hash = `#${url}`
        }
    }

    #handleColumnSetup = (columns) => {
        // suppression des colonnes
        const newColumns = this.#columns.filter(c => columns.includes(c))
        // ajout des nvlles colonnes à la fin
        newColumns.push(...columns.filter(c => !newColumns.includes(c)))
        this.#handleColumnChanged(newColumns)
    }

    #handleColumnChanged = (columns) => {
        this.#columns = columns
        this.#table.clear()
        this.#columns.forEach(column => this.#table.addColumn(column))
        this.#parsePage(this.#bundle)

        const pref = preferencesService.get('columns', {})
        pref[this.#resourceType] = this.#columns
        preferencesService.set('columns', pref)
    }

    #settingsDialogToggleClick = () => {
        this.#settingsDialog.load(this.#resourceType, this.#columns)
        this.#settingsDialog.hidden = false
    }

    #paginationClick = ({ target }) => {
        if (target.localName !== 'm2-round-button') return
        let url = target.dataset.url
        url = url.replace(`${context.server.url}`, '')
        location.hash = `#${url}`
    }

    #helpClick = () => {
        window.open(context.server.resourceHelpUrl(this.#resourceType), 'FhirBrowserHelp')
    }

    #copyClick = () => {
        navigator.clipboard.writeText(JSON.stringify(this.#bundle)).then(function () {
            snackbarService.info('Copying to clipboard was successful')
        }, function (err) {
            console.error('Async: Could not copy text: ', err)
        })
    }

    #downloadClick = () => {
        const fileName = this.#resourceType
        const file = new File([JSON.stringify(this.#bundle)], fileName, {
            type: 'data:text/json;charset=utf-8'
        })
        const url = URL.createObjectURL(file)
        const link = document.createElement('a')
        link.href = url
        link.download = `${fileName}.json`
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    }

    /**
     * @returns {String}
     */
    get resourceType () {
        return this.#resourceType
    }

    #beautifyDate (stringdate) {
        const dateOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        }
        try {
            const date = new Date(stringdate)
            return `${date.toLocaleString(undefined, dateOptions)}<br>${date.toLocaleString(undefined, timeOptions)}`
        } catch (e) {
            return stringdate
        }
    }

    #columnType = (column) => {
        let parent = context.server.schema.getDefinitionByResourceType(this.#resourceType)
        let type = 'string'
        column.split('.').forEach(property => {
            const prop = parent.properties[property]
            const ref = prop.$ref || prop.items?.$ref
            if (ref) {
                parent = context.server.schema.getDefinitionByRef(ref)
                type = ref.replace(/^#\/definitions\//, '')
            } else if (prop.type) {
                type = prop.type
            } else {
                type = 'string'
            }
        })
        return type
    }

    #parsePage (data) {
        this.#total.hidden = true
        if (data.total) {
            this.#total.hidden = false
            this.#total.innerHTML = `Total:&nbsp;${data.total}`
        }

        if (data.entry) {
            const columnTypes = this.#columns.reduce((map, column) => {
                map[column] = this.#columnType(column)
                return map
            }, {})
            data.entry
                .forEach(entry => {
                    const row = {}
                    this.#columns.forEach(column => {
                        let value = entry.resource
                        const path = column.split('.')
                        path.every((expr, idx) => {
                            value = eval('value[expr]')
                            if (value === null || typeof value === 'undefined') return false
                            if (Array.isArray(value)) {
                                if (idx === path.length - 1) {
                                    value = value.join(', ')
                                } else {
                                    value = value[0]
                                }
                            }
                            return true
                        })
                        if (value === null || typeof value === 'undefined') {
                            row[column] = ''
                        } else {
                            const type = columnTypes[column] || 'string'
                            if (['instant', 'dateTime'].includes(type)) value = this.#beautifyDate(value)
                            row[column] = value
                        }
                    })
                    this.#table.addRow(entry.resource.id, row)
                })

            Object.entries(this.#buttons).forEach(([, button]) => {
                button.setAttribute('disabled', '')
                button.removeAttribute('data-relation')
                button.removeAttribute('data-url')
            })

            data.link?.forEach(({ relation, url }) => {
                this.#buttons[relation]?.removeAttribute('disabled')
                this.#buttons[relation]?.setAttribute('data-relation', relation)
                this.#buttons[relation]?.setAttribute('data-url', url)
            })
        }
    }

    /**
     * @return {fhir4.Bundle} bundle
     */
    get source () {
        return this.#bundle
    }

    /**
     * @param {fhir4.Bundle} bundle
     */
    set source (bundle) {
        let resourceType
        let singleResourceType = false
        if (bundle.entry?.length) {
            const types = [...new Set(bundle.entry.map(entry => entry.resource.resourceType))]
            singleResourceType = (types.length === 1)
            if (singleResourceType) {
                resourceType = types[0]
            } else {
                resourceType = 'Bundle'
            }
        } else {
            const hash = window.location.hash.replace('#/', '').trim()
            resourceType = /^\w+/.exec(hash)[0]
        }

        this.#resourceType = resourceType

        let title = resourceType

        if (singleResourceType) {
            const pref = preferencesService.get('columns', {})
            this.#columns = pref[resourceType] || ['id', 'meta.lastUpdated']
            this.#settingsDialogToggle.hidden = false
            this.#searchPanel.hidden = false
        } else {
            this.#settingsDialogToggle.hidden = true
            this.#searchPanel.hidden = true
            this.#columns = ['resourceType', 'id']
            if (resourceType === 'Bundle') {
                title = `${bundle.type} ${title.toLowerCase()}`
            }
        }
        this.#title.innerText = title

        this.#table.clear()
        this.#columns.forEach(column => this.#table.addColumn(column))

        this.#bundle = bundle
        this.#parsePage(bundle)

        this.#setFavoriteToggleStyle()
    }

    #favoriteToggleClick = () => {
        favoriteService.toggle(this.#resourceType)
    }

    #setFavoriteToggleStyle = () => {
        this.#favoriteToggle.style.color = favoriteService.favorites.includes(this.#resourceType) ? 'var(--primary-color)' : 'unset'
    }
};
customElements.define('fhir-bundle', Bundle)
