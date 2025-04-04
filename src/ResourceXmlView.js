import template from './templates/ResourceXmlView.html'

import './components/M2Switch'

import context from './services/Context'
import preferencesService from './services/Preferences'
import SnackbarService from './services/Snackbar'
import M2RoundButton from './components/M2RoundButton'

export default class ResourceXmlView extends HTMLElement {
    /** @type {fhir4.Resource} */
    #resource
    /** @type {HTMLElement} */
    #content
    /** @type {M2RoundButton} */
    #sortToggle
    /** @type {Boolean} */
    #sort

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template

        this.#resource = null

        this.#content = shadow.getElementById('content')
        this.#content.onclick = this.#contentClick

        this.#sort = preferencesService.get('xmlView', { sorted: false }).sorted

        this.#sortToggle = shadow.getElementById('sort-toggle')
        this.#sortToggle.onclick = this.#sortToggleClick

        shadow.getElementById('download').onclick = this.#downloadClick

        shadow.getElementById('copy').onclick = this.#copyClick

        shadow.getElementById('share').onclick = this.#shareClick
    }

    connectedCallback () {
        this.#sortChange()
    }

    #sortToggleClick = () => {
        this.#sort = !this.#sort
        preferencesService.set('xmlView', { sorted: this.#sort })
        this.#sortChange()
    }

    #sortChange = () => {
        this.#sortToggle.style.color = this.#sort ? 'var(--primary-color)' : 'unset'
        if (this.#resource) this.source = this.#resource
    }

    #contentClick = ({ target, offsetX, offsetY, ctrlKey }) => {
        if (target.classList.contains('object')) {
            const key = target.childNodes[0]
            if (key && offsetX < key.offsetLeft && offsetY < key.offsetHeight) {
                target.classList.toggle('collapsed')
                if (ctrlKey) {
                    const collapsed = target.classList.contains('collapsed')
                    Array.from(target.querySelectorAll('dt'))
                        .filter(e => e.classList.contains('object'))
                        .forEach(e => {
                            if (collapsed) {
                                e.classList.add('collapsed')
                            } else {
                                e.classList.remove('collapsed')
                            }
                        })
                }
            }
        }
    }

    /** @returns {void} */
    clear = () => {
        this.#content.scrollTo(0, 0)
        this.#content.innerHTML = 'Loading...'
        this.#content.style.cursor = 'wait'
        this.#resource = null
    }

    /** @returns {String} */
    get resourceType () {
        return this.#resource?.documentElement?.nodeName
    }

    /** @returns {String} */
    get resourceId () {
        return this.#resource?.documentElement?.querySelector('id[value]')?.getAttribute('value')
    }

    /** @returns {Fhir.Resource} */
    get source () {
        return this.#resource
    }

    /**
     * @param {Fhir.resource} resource
     * @returns {void}
     */
    set source (resource) {
        this.#content.scrollTo(0, 0)
        this.#content.innerHTML = this.#parse(resource).outerHTML
        this.#content.style.cursor = 'default'
        this.#resource = resource
    }

    #parse = (obj) => {
        const dl = document.createElement('dl')
        const entries = Array.from(obj.children)
        if (this.#sort) {
            entries.sort((n1, n2) => {
                return n1.nodeName.localeCompare(n2.nodeName)
            })
        }
        entries.forEach(e => {
            const dt = document.createElement('dt')

            let keyElm = document.createElement('span')
            keyElm.className = 'key'
            keyElm.innerText = e.nodeName
            dt.appendChild(keyElm)

            if (e.attributes.length) {
                Array.from(e.attributes).forEach(a => {
                    const atb = document.createElement('span')
                    atb.className = 'attributes'
                    atb.innerText = ` ${a.nodeName}=`
                    keyElm.appendChild(atb)
                    const val = document.createElement('span')
                    val.className = 'values'
                    if (e.nodeName === 'reference' && a.nodeName === 'value') {
                        let url = a.nodeValue.replace(`${context.server.url}`, '')
                        if (!url.startsWith('/') && !url.startsWith('?')) url = `/${url}`
                        const link = document.createElement('a')
                        link.setAttribute('href', `#${url}`)
                        link.appendChild(document.createTextNode(`"${a.nodeValue}"`))
                        val.appendChild(link)
                    } else {
                        val.innerText = `"${a.nodeValue}"`
                    }
                    atb.appendChild(val)
                })
            }

            const valueElm = document.createElement('span')
            valueElm.classList.add('value')
            if (e.children.length) {
                dt.classList.add('object')
                valueElm.innerHTML = this.#parse(e).outerHTML
                dt.appendChild(valueElm)

                keyElm = document.createElement('span')
                keyElm.className = 'key end'
                keyElm.innerText = `/${e.nodeName}`
                dt.appendChild(keyElm)
            } else {
                keyElm.innerHTML += '/'
            }

            dl.appendChild(dt)
        })
        return dl
    }

    #downloadClick = () => {
        const content = new XMLSerializer().serializeToString(this.#resource)
        const file = new File([content], this.resourceId, {
            type: 'data:text/xml;charset=utf-8'
        })
        const url = URL.createObjectURL(file)
        const link = document.createElement('a')
        link.href = url
        link.download = `${this.resourceType}#${file.name}.xml`
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    }

    #copyClick = () => {
        const content = new XMLSerializer().serializeToString(this.#resource)
        navigator.clipboard.writeText(content).then(function () {
            SnackbarService.info('Copying to clipboard was successful')
        }, function () {
            SnackbarService.error('Could not copy text')
        })
    }

    #shareClick = () => {
        const content = new XMLSerializer().serializeToString(this.#resource)
        const fileName = `${this.resourceType}.${this.resourceId}.txt`
        const file = new File([content], fileName, { type: 'text/plain' })
        navigator.share({
            title: fileName,
            files: [file]
        })
    }
}
customElements.define('resource-xml-view', ResourceXmlView)
