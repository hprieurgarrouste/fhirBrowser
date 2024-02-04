import template from './templates/ServerCapabilities.html'

import context from '../services/Context'
import M2List from '../components/M2List'
import M2ListItem from '../components/M2ListItem'
import M2ListRow from '../components/M2ListRow'

export default class ServerCapabilities extends HTMLElement {
    /** @type {M2List} */
    #list

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#list = shadow.querySelector('m2-list')
    }

    /**
     * @param {fhir4.CapabilityStatement} capabilityStatement
     * @returns {void}
     */
    load = (capabilityStatement) => {
        const make = (name, value) => {
            if (typeof value === 'undefined') return

            const row = new M2ListRow()
            row.append(new M2ListItem(undefined, name, value))
            this.#list.append(row)
        }

        this.#list.clear()

        make('copyright', capabilityStatement.copyright)
        make('description', capabilityStatement.description)
        make('fhirVersion', `${capabilityStatement.fhirVersion} (${context.server.release})`)

        const ul = document.createElement('UL')
        ul.append(...capabilityStatement.format.map(f => {
            const li = document.createElement('LI')
            li.innerText = f
            return li
        }))
        make('format', ul.outerHTML)

        if (capabilityStatement.implementation) {
            make('implementation description', capabilityStatement.implementation.description)
            make('implementation name', capabilityStatement.implementation.name)
            make('implementation url', capabilityStatement.implementation.url)
        }
        make('language', capabilityStatement.language)
        make('name', capabilityStatement.name)
        make('publisher', capabilityStatement.publisher)
        if (capabilityStatement.software) {
            make('software name', capabilityStatement.software.name)
            make('software version', capabilityStatement.software.version)
            make('software release date', capabilityStatement.software.releaseDate)
        }
    }
};
customElements.define('server-capabilities', ServerCapabilities)
