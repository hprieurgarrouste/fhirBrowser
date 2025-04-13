import template from './templates/ServerPanel.html'

import '../components/M2Tabs'
import '../components/M2Avatar'
import '../components/M2ListItem'

import './ServerCapabilities'
import './ServerResources'

import context from '../services/Context'
import FavoritesService from '../services/Favorites'

export default class ServerPanel extends HTMLElement {
    /** @type {M2ListItem} */
    #serverTitle
    /** @type {ServerResources} */
    #serverResources
    /** @type {ServerCapabilities} */
    #serverCapabilities
    /** @type {M2Tabs} */
    #tabs

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#serverTitle = shadow.getElementById('serverTitle')
        this.#tabs = shadow.querySelector('m2-tabs')
        this.#serverResources = shadow.querySelector('server-resources')
        this.#serverCapabilities = shadow.querySelector('server-capabilities')
        FavoritesService.addListener(this.#favoritesListener)
    }

    connectedCallback () {
        context.addListener(this.#serverListener)
        FavoritesService.addListener(this.#favoritesListener)
    }

    #serverListener = () => {
        const server = context.server
        this.#serverTitle.setAttribute('data-primary', server.serverCode)
        this.#serverTitle.setAttribute('data-secondary', server.capabilities?.implementation?.description || server.capabilities?.software?.name || server.url)
        this.#serverResources.load(server.capabilities)
        this.#serverCapabilities.load(server.capabilities)
    }

    #favoritesListener = () => {
        const current = this.#serverResources.value
        this.#serverResources.load(context.server.capabilities)
        this.value = current
    }

    /**
     * @param {String} resourceType
     */
    set value (resourceType) {
        this.#tabs.value = 'Resource Types'
        this.#serverResources.value = resourceType
    }
}
customElements.define('server-panel', ServerPanel)
