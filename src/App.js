import template from './templates/App.html'

import './components/M2ColorScheme'
import './components/M2CircularProgress'
import './components/M2LinearProgress'
import './components/M2Button'

import AboutDialog from './AboutDialog'
import './Bundle'
import './OperationOutcome'
import './Resource'

import context from './services/Context'
import preferencesService from './services/Preferences'
import settingsService from './services/Settings'
import snackbarService from './services/Snackbar'
import Server from './services/Server'

import './server/ServerDialog'
import './server/ServerPanel'
import ServerConfiguration from './server/ServerConfiguration'

/* Only register a service worker if it's supported */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
}

export default class App extends HTMLElement {
    /** @type {ServerDialog} */
    #serverDialog
    /** @type {AboutDialog} */
    #aboutDialog
    /** @type {OperationOutcome} */
    #operationOutcomeView
    /** @type {M2Button} */
    #navigationToggle
    /** @type {ServerPanel} */
    #serverPanel
    /** @type {Bundle} */
    #bundleView
    /** @type {Resource} */
    #resourceView
    /** @type {HTMLElement} */
    #body
    /** @type {HTMLElement} */
    #waiting

    constructor () {
        super()

        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        context.appContainer = shadow

        this.#serverPanel = shadow.querySelector('server-panel')
        this.#body = shadow.getElementById('bdy')

        this.#navigationToggle = shadow.getElementById('navigation')
        this.#navigationToggle.onclick = () => this.#serverPanel.classList.toggle('hidden')

        this.#waiting = shadow.getElementById('waiting')

        this.#serverDialog = shadow.querySelector('server-dialog')
        this.#serverDialog.onSelect = this.#connect

        shadow.getElementById('serverDialogToggle').onclick = () => {
            this.#serverDialog.value = context.server?.serverCode
            this.#serverDialog.hidden = false
        }

        shadow.getElementById('aboutDialogToggle').onclick = this.#aboutDialogToggleClick

        this.#bundleView = shadow.querySelector('fhir-bundle')
        this.#resourceView = shadow.querySelector('fhir-resource')
        this.#operationOutcomeView = shadow.querySelector('fhir-operation-outcome')
    }

    #aboutDialogToggleClick = () => {
        if (this.#aboutDialog) {
            this.#aboutDialog.hidden = false
        } else {
            this.#aboutDialog = new AboutDialog()
            context.appContainer.appendChild(this.#aboutDialog)
        }
    }

    #fetchHash = async (hash) => {
        snackbarService.clear()
        const url = new URL(`${context.server.url}${hash}`)
        const timeoutId = setTimeout(() => {
            this.#waiting.style.visibility = 'visible'
        }, 500)

        try {
            const headers = {}
            Object.assign(headers, context.server.headers)
            switch (url.searchParams.get('_format')) {
            case 'xml':
                headers.Accept = 'application/fhir+xml'
                break
            case 'ttl':
                headers.Accept = 'application/x-turtle'
                break
            case 'json':
            default:
                headers.Accept = 'application/fhir+json'
            }
            const response = await fetch(url, {
                headers
            })
            const contentType = response.headers.get('Content-Type')
            if (!response.ok) {
                const msg = `${response.status} ${response.statusText}`
                if (!contentType) throw new Error(msg)
                snackbarService.error(msg)
            }
            this.#body.style.visibility = 'visible'
            let sourceType
            let source
            if (contentType?.includes('json')) {
                source = await response.json()
                sourceType = source.resourceType
            } else if (contentType?.includes('xml')) {
                source = new DOMParser().parseFromString(await response.text(), 'application/xml')
                sourceType = source.documentElement.nodeName
            } else {
                source = await response.text()
                const match = source.match(/rdf:type\s+fhir:(\w+)/) // is TTL ?
                if (match) sourceType = match[1]
            }
            if (sourceType) {
                if (sourceType === 'OperationOutcome') {
                    this.#bundleView.hidden = true
                    this.#resourceView.hidden = true
                    this.#operationOutcomeView.hidden = false
                    this.#operationOutcomeView.source = source
                } else if (sourceType === 'Bundle') {
                    this.#bundleView.hidden = false
                    this.#resourceView.hidden = true
                    this.#operationOutcomeView.hidden = true
                    this.#bundleView.source = source
                    this.#serverPanel.value = this.#bundleView.resourceType
                } else {
                    this.#bundleView.hidden = true
                    this.#resourceView.hidden = false
                    this.#operationOutcomeView.hidden = true
                    this.#resourceView.source = source
                    this.#serverPanel.value = this.#resourceView.resourceType
                }
            } else {
                throw new Error('Unknown response format')
            }
        } catch (error) {
            snackbarService.error(error)
        } finally {
            clearTimeout(timeoutId)
            this.#waiting.style.visibility = 'hidden'
        }
    }

    #locationHandler = () => {
        const hash = window.location.hash.replace('#', '').trim()
        if (hash.length) {
            if (window.matchMedia('(max-width: 480px)').matches) {
                this.#serverPanel.classList.add('hidden')
            }
            this.#fetchHash(hash)
        } else {
            this.#serverPanel.value = ''
            this.#body.style.visibility = 'hidden'
            this.#serverPanel.classList.remove('hidden')
        }
    }

    connectedCallback () {
        window.addEventListener('hashchange', this.#locationHandler)

        const preferedServer = preferencesService.get('server')
        if (preferedServer) {
            settingsService.get(preferedServer).then((configuration) => {
                this.#connect({
                    code: preferedServer,
                    configuration
                })
            })
        } else {
            this.#serverDialog.hidden = false
        }
    }

    #connect = ({ code, configuration }) => {
        this.#waiting.style.visibility = 'visible'
        const serverConfiguration = new ServerConfiguration(configuration)
        const server = new Server(code, serverConfiguration)
        server.connect().then(() => {
            context.server = server
            snackbarService.show(`Connected to "${code}" server.`)
            preferencesService.set('server', code)
            this.#navigationToggle.hidden = false
            if (location.hash) {
                location.hash = ''
            } else {
                this.#locationHandler()
            }
        }).catch(error => {
            snackbarService.error(`An error occurred while connecting to the server "${code}"`)
            console.log(error)
        }).finally(() => {
            this.#waiting.style.visibility = 'hidden'
        })
    }
};
customElements.define('fhir-browser', App)
