import template from './templates/ResourceValidate.html'

import './components/M2LinearProgress'
import './components/M2List'
import './components/M2SidePanel'

import M2ListRow from './components/M2ListRow'
import M2ListItem from './components/M2ListItem'

import context from './services/Context'

export default class ResourceValidate extends HTMLElement {
    /** @type {M2List} */
    #list
    /** @type {M2LinearProgress} */
    #progress

    /** @enum {String} */
    #severityIcon = Object.freeze({
        information: 'info',
        warning: 'warning',
        error: 'error',
        fatal: 'dangerous'
    })

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template

        shadow.getElementById('help').onclick = this.#helpClick

        this.#list = shadow.querySelector('m2-list')
        this.#list.onclick = this.#appListClick
        this.#list.onFilter = this.#appListFilter

        this.#progress = shadow.querySelector('m2-linear-progress')

        shadow.getElementById('close').onclick = this.#sidePanelClose
    }

    #appListClick = (event) => {
        event.preventDefault()
        event.stopPropagation()
    }

    /**
     * @param {String} value
     * @param {Boolean} caseSensitive
     * @returns {void}
     */
    #appListFilter = ({ value, caseSensitive }) => {
        const filter = new RegExp(value, caseSensitive ? '' : 'i')
        this.#list.querySelectorAll('m2-list-item').forEach(item => {
            item.parentNode.hidden = !(filter.exec(item.dataset.primary) || filter.exec(item.dataset.secondary))
        })
    }

    #helpClick = (event) => {
        window.open(context.server.validateHelpUrl(), 'FhirBrowserHelp')
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
        if (!(resourceType?.operation?.find(({ name }) => name === 'validate') || context.server.capabilities.rest[0].operation?.find(({ name }) => name === 'validate'))) return
        this.#progress.hidden = false

        this.#list.clear()

        this.#validateResource(resourceType.type, resourceId).then(response => {
            this.#progress.hidden = true
            this.#list.append(...response.issue.map(issue => {
                const row = new M2ListRow()
                row.append(new M2ListItem(
                    this.#severityIcon[issue.severity] || 'error',
                    Array.isArray(issue.location) ? issue.location[0] : issue.code,
                    issue.diagnostics
                ))
                return row
            }))
        })
    }

    /**
     * Send validate request to server
     * @param {String} type - Resource type
     * @param {String} id - Resource id
     * @returns {Promise<fhir4.OperationOutcome>}
     */
    #validateResource = async (type, id) => {
        return await context.server.fetch(`/${type}/${id}/$validate`, {
            _format: 'json'
        })
    }
};

customElements.define('resource-validate', ResourceValidate)
