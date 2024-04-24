import template from './templates/Resource.html'

import './components/M2AppBar'
import M2RoundButton from './components/M2RoundButton'
import './components/M2Tabs'

import ResourceHistory from './ResourceHistory'
import ResourceReferences from './ResourceReferences'
import ResourceJsonView from './ResourceJsonView'
import ResourceTtlView from './ResourceTtlView'
import ResourceXmlView from './ResourceXmlView'

import context from './services/Context'

export default class Resource extends HTMLElement {
    /** @type {M2RoundButton} */
    #referencesToggle
    /** @type {ResourceReferences} */
    #referencesPanel
    /** @type {M2RoundButton} */
    #historyToggle
    /** @type {ResourceHistory} */
    #historyPanel
    /** @type {M2Tabs} */
    #tabs
    /** @type {HTMLHeadingElement} */
    #title

    /** @type {fhir4.CapabilityStatementRestResource} */
    #resourceType
    /** @type {String} */
    #resourceId
    /** @type {any} */
    #views
    /** @type {Boolean} */
    #historyDisabled

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template

        shadow.getElementById('help').onclick = this.#helpClick

        this.#referencesToggle = shadow.getElementById('referencesToggle')
        this.#referencesToggle.onclick = this.#referenceToggleClick
        this.#referencesPanel = shadow.querySelector('resource-references')

        this.#historyDisabled = null
        this.#historyToggle = shadow.getElementById('historyToggle')
        this.#historyToggle.onclick = this.#historyToggleClick
        this.#historyPanel = shadow.querySelector('resource-history')

        this.#tabs = shadow.querySelector('m2-tabs')
        this.#tabs.addEventListener('select', this.#tabSelect)

        this.#title = shadow.getElementById('title')

        this.#resourceType = null
        this.#resourceId = null
        this.#views = {}
    }

    connectedCallback () {
        context.addListener(this.#serverChanged)
        new MutationObserver(this.#panelHiddenObserver).observe(
            this.#referencesPanel,
            { attributes: true }
        )
        new MutationObserver(this.#panelHiddenObserver).observe(
            this.#historyPanel,
            { attributes: true }
        )
    }

    #panelHiddenObserver = (mutationList) => {
        mutationList.forEach(({ type, attributeName, target }) => {
            if (type === 'attributes' && attributeName === 'hidden') {
                if (target === this.#historyPanel) {
                    this.#historyToggle.hidden =
                        this.#historyDisabled || !target.hidden
                } else if (target === this.#referencesPanel) {
                    this.#referencesToggle.hidden = !target.hidden
                }
            }
        })
    }

    #tabSelect = ({ detail }) => {
        const format = detail.caption
        const hashSearchParams = location.hash.match(/\?([^?]+)$/)
        if (hashSearchParams?.length > 0) {
            const searchParams = new URLSearchParams(hashSearchParams[1])
            searchParams.set('_format', format)
            location.hash = location.hash.replace(
                /\?[^?]+$/,
                `?${searchParams.toString()}`
            )
        } else {
            location.hash = `${location.hash}?_format=${format}`
        }
    }

    #referenceToggleClick = () => {
        if (this.#referencesPanel.hidden) {
            this.#historyPanel.hidden = true
            this.#referencesPanel.load(this.#resourceType, this.#resourceId)
        }
        this.#referencesPanel.hidden = !this.#referencesPanel.hidden
    }

    #historyToggleClick = () => {
        if (this.#historyPanel.hidden) {
            this.#referencesPanel.hidden = true
            this.#historyPanel.load(this.#resourceType, this.#resourceId)
        }
        this.#historyPanel.hidden = !this.#historyPanel.hidden
    }

    #helpClick = () => {
        window.open(
            `${context.server.resourceHelpUrl(
                this.#resourceType.type
            )}#resource`,
            'FhirBrowserHelp'
        )
    }

    #serverChanged = () => {
        while (this.#tabs.firstChild) {
            this.#tabs.removeChild(this.#tabs.lastChild)
        }

        this.#views = {}
        const server = context.server

        if (server.isFormatEnable('json')) {
            const view = new ResourceJsonView()
            const section = document.createElement('section')
            section.dataset.caption = 'json'
            section.appendChild(view)
            this.#tabs.appendChild(section)
            this.#views.json = view
        }

        if (server.isFormatEnable('xml')) {
            const view = new ResourceXmlView()
            const section = document.createElement('section')
            section.dataset.caption = 'xml'
            section.appendChild(view)
            this.#tabs.appendChild(section)
            this.#views.xml = view
        }

        if (server.isFormatEnable('ttl')) {
            const view = new ResourceTtlView()
            const section = document.createElement('section')
            section.dataset.caption = 'ttl'
            section.appendChild(view)
            this.#tabs.appendChild(section)
            this.#views.ttl = view
        }
    }

    /**
     * @param {fhir4.Resource} resource
     */
    set source (resource) {
        let format
        if (resource instanceof Document) {
            format = 'xml'
        } else if (typeof resource === 'object') {
            format = 'json'
        } else {
            format = 'ttl'
        }
        if (format) {
            const view = this.#views[format]
            view.source = resource
            const resourceType = view.resourceType
            this.#title.innerText = resourceType
            const resourceId = view.resourceId

            if (
                resourceId !== this.#resourceId ||
                resourceType !== this.#resourceType?.type
            ) {
                this.#resourceType =
                    context.server.capabilities.rest[0].resource.find(
                        (res) => res.type === resourceType
                    )
                this.#resourceId = resourceId
                Object.entries(this.#views)
                    .filter(([key]) => key !== format)
                    .forEach(([, value]) => value.clear())
            }
            this.#tabs.value = format
        }

        if (window.matchMedia('(max-width: 480px)').matches) {
            this.#referencesPanel.hidden = true
            this.#historyPanel.hidden = true
        }

        this.#historyDisabled =
            this.#resourceType?.interaction.find(
                ({ code }) => code === 'vread'
            ) === undefined
        if (this.#historyDisabled) {
            this.#historyPanel.hidden = true
            this.#historyToggle.hidden = true
        } else {
            this.#historyToggle.hidden = !this.#historyPanel.hidden
        }

        if (!this.#historyPanel.hidden) {
            this.#historyPanel.load(this.#resourceType, this.#resourceId)
        }
        if (!this.#referencesPanel.hidden) {
            this.#referencesPanel.load(this.#resourceType, this.#resourceId)
        }
    }

    /** @returns {String} */
    get resourceType () {
        return this.#resourceType.type
    }
}

customElements.define('fhir-resource', Resource)
