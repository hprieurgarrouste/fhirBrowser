import template from './templates/ResourceJsonView.html'

import './components/M2ButtonGroup'
import './components/M2RoundButton'

import context from './services/Context'
import preferencesService from './services/Preferences'
import snackbarService from './services/Snackbar'

export default class ResourceJsonView extends HTMLElement {
    /** @type {fhir4.Resource} */
    #resource
    /** @type {HTMLElement} */
    #content
    /** @type {M2RoundButton} */
    #sortToggle
    /**
     * @type {Object}
     * @property {(raw|enhanced)} mode
     */
    #preferences
    #MODE = {
        raw: 'raw',
        object: 'object'
    }

    /** @type {M2ButtonGroup} */
    #modeToggle

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template

        this.#resource = null

        this.#content = shadow.getElementById('content')
        this.#content.onclick = this.#contentClick

        this.#preferences = preferencesService.get('jsonView', { mode: this.#MODE.object })

        this.#sortToggle = shadow.getElementById('sort-toggle')
        this.#sortToggle.onclick = this.#sortToggleClick
        this.#sortChange()

        this.#modeToggle = shadow.querySelector('m2-button-group')
        this.#modeToggle.onclick = this.#modeToggleClick

        shadow.getElementById('download').onclick = this.#downloadClick
        shadow.getElementById('copy').onclick = this.#copyClick
        shadow.getElementById('share').onclick = this.#shareClick
    }

    connectedCallback () {
        this.#modeChange()
    }

    #modeToggleClick = (event) => {
        switch (this.#modeToggle.value) {
        case 'raw':
            this.#preferences.mode = this.#MODE.raw
            break
        case 'object':
            this.#preferences.mode = this.#MODE.object
            break
        }
        preferencesService.set('jsonView', this.#preferences)
        this.#modeChange()
    }

    #modeChange = () => {
        this.#modeToggle.value = this.#preferences.mode
        switch (this.#preferences.mode) {
        case this.#MODE.raw:
            this.#content.hidden = false
            this.#sortToggle.hidden = true
            break
        case this.#MODE.object:
            this.#content.hidden = false
            this.#sortToggle.hidden = false
            break
        }
        if (this.#resource) this.source = this.#resource
    }

    #sortToggleClick = () => {
        this.#preferences.sortMode = !this.#preferences.sortMode
        preferencesService.set('jsonView', this.#preferences)
        this.#sortChange()
    }

    #sortChange = () => {
        this.#sortToggle.style.color = this.#preferences.sortMode ? 'var(--primary-color)' : 'unset'
        if (this.#resource) this.source = this.#resource
    }

    #contentClick = ({ target, offsetX, offsetY, ctrlKey }) => {
        if (target.querySelector('span.value.array') || target.querySelector('span.value.object')) {
            const key = target.childNodes[0]
            if (key && offsetX < key.offsetLeft && offsetY < key.offsetHeight) {
                target.classList.toggle('collapsed')
                if (ctrlKey) {
                    const collapsed = target.classList.contains('collapsed')
                    Array.from(target.querySelectorAll('dt'))
                        .filter(e => e.classList.contains('object') || e.classList.contains('array'))
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

    clear = () => {
        this.#content.scrollTo(0, 0)
        this.#content.innerHTML = 'Loading...'
        this.#content.style.cursor = 'wait'
        this.#resource = null
    }

    /** @returns {string} */
    get resourceType () {
        return this.#resource.resourceType
    }

    /** @returns {string} */
    get resourceId () {
        return this.#resource.id
    }

    /** @returns {fhir4.Resource} */
    get source () {
        return this.#resource
    }

    /** @param {fhir4.Resource} resource */
    set source (resource) {
        this.#content.scrollTo(0, 0)
        this.#content.innerHTML = ''
        if (this.#MODE.raw === this.#preferences.mode) {
            const pre = document.createElement('pre')
            pre.classList.add('raw')
            pre.innerText = JSON.stringify(resource, null, 4)
            this.#content.append(pre)
        } else {
            const valueElm = document.createElement('span')
            valueElm.classList.add('value', 'object', resource.resourceType)
            valueElm.append(...this.#makeObjectElm(resource, resource.resourceType))
            const dt = document.createElement('DT')
            dt.append(valueElm)
            const dl = document.createElement('DL')
            dl.append(dt)
            this.#content.append(dl)
        }
        this.#content.style.cursor = 'default'
        this.#resource = resource
    }

    /**
     * @param {fhir4.StructureDefinition} structureDefinition
     * @param {string} id
     * @returns {fhir4.ElementDefinition}
     */
    #resolveType = (structureDefinition, id) => {
        const prop = structureDefinition.properties[id]
        if (prop.const) {
            return 'string'
        } else if (prop.type) {
            if (prop.type === 'array') {
                return prop.items.$ref.split('/').pop()
            }
            return prop.type
        } else if (prop.$ref) {
            return prop.$ref.split('/').pop()
        }
    }

    /**
     * @param {object} obj
     * @param {String} type
     * @returns {HTMLElement[]}
     */
    #makeObjectElm = (obj, type) => {
        const ret = []
        context.server.schema.getDefinitionByName(type)
        // add helper btn at the begenning
        if (type === 'Address') {
            const btn = this.#makeAddressValueBtn(obj)
            if (btn) ret.push(btn)
        } else if (['Binary', 'Attachment'].includes(type)) {
            const btn = this.#makeAttachmentValueBtn(obj)
            if (btn) ret.push(btn)
        }

        let entries = Object.entries(obj)
        if (this.#preferences.sortMode) entries = entries.sort()

        const definition = context.server.schema.getDefinitionByName(type)
        /** @type {HTMLDListElement} */
        const dl = document.createElement('dl')
        dl.append(...entries.map(([key, value]) => {
            const valueElm = document.createElement('span')
            valueElm.classList.add('value')
            const entryType = this.#resolveType(definition, key)
            if (type === 'Reference' && key === 'reference') {
                this.#makeReferenceValueElm(valueElm, value)
            } else if (type === 'ContactPoint' && key === 'value') {
                this.#makeContactPointValueElm(valueElm, obj, value)
            } else {
                this.#makeValueElm(valueElm, value, entryType)
            }
            const dt = document.createElement('dt')
            dt.append(this.#makeKeyElm(key), valueElm)
            return dt
        }))
        ret.push(dl)
        return ret
    }

    /** @param {string} key */
    #makeKeyElm = (key) => {
        const keyElm = document.createElement('span')
        keyElm.className = 'key'
        keyElm.innerText = key
        return keyElm
    }

    /**
     * @param {HTMLElement} valueElm
     * @param {fhir4.Resource} value
     * @param {String} type
     */
    #makeValueElm = (valueElm, value, type) => {
        if (value === null) {
            valueElm.append('null')
        } else if (Array.isArray(value)) {
            valueElm.classList.add('array', type)
            valueElm.append(this.#makeArrayElm(value, type))
        } else if (typeof value === 'object') {
            valueElm.classList.add('object', type)
            valueElm.append(...this.#makeObjectElm(value, type))
        } else if (['instant', 'dateTime'].includes(type)) {
            this.#makeInstantValueElm(valueElm, value, type)
        } else if (['url', 'uri'].includes(type)) {
            this.#makeUrlValueElm(valueElm, value)
        } else {
            valueElm.classList.add(type)
            valueElm.append(value)
        }
    }

    /**
     * @param {HTMLElement} valueElm
     * @param {fhir4.Attachment} attachment
     */
    #makeAttachmentValueBtn = (attachment) => {
        if (attachment.contentType && attachment.data) {
            const btn = document.createElement('i')
            btn.className = 'material-symbols-sharp'
            btn.innerText = 'open_in_new'
            btn.title = 'View'
            btn.onclick = () => { window.open(makeJson(), '_blank') }
            return btn
        }

        function makeJson () {
            const contentType = `${attachment.contentType};charset=UTF-8`
            const byteCharacters = window.atob(attachment.data)
            const byteArrays = []
            for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
                const slice = byteCharacters.slice(offset, offset + 1024)
                const byteNumbers = new Array(slice.length)
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i)
                }
                const byteArray = new Uint8Array(byteNumbers)
                byteArrays.push(byteArray)
            }
            const blob = new Blob(byteArrays, { type: contentType })
            return URL.createObjectURL(blob)
        }
    }

    /**
     * @param {HTMLElement} valueElm
     * @param {fhir4.Address} address
     * @param {fhir4.StructureDefinition} structureDefinition
     */
    #makeAddressValueBtn = (address) => {
        let query = ''
        address.line?.forEach(l => { query += ` ${l}` })
        query += address.postalCode ? ` ${address.postalCode}` : ''
        query += address.city ? ` ${address.city}` : ''
        query += address.country ? ` ${address.country}` : ''
        query = query.replaceAll(' ', '+')

        const btn = document.createElement('i')
        btn.className = 'material-symbols-sharp'
        btn.innerText = 'open_in_new'
        btn.title = 'View'
        btn.onclick = () => { window.open(`http://www.google.com/maps?q=${query}`, '_blank') }
        return btn
    }

    /**
     * @param {HTMLElement} valueElm
     * @param {fhir4.ContactPoint} contactPoint
     * @param {String} value
     */
    #makeContactPointValueElm = (valueElm, contactPoint, value) => {
        const a = document.createElement('a')
        switch (contactPoint.system) {
        case 'email':
            a.setAttribute('href', `mailto:${value}`)
            a.append(value)
            valueElm.append(a)
            break
        case 'phone':
            a.setAttribute('href', `tel:${value}`)
            a.append(value)
            valueElm.append(a)
            break
        case 'sms':
            a.setAttribute('href', `sms:${value}`)
            a.append(value)
            valueElm.append(a)
            break
        case 'url':
            a.setAttribute('href', value)
            a.setAttribute('target', '_blank')
            a.append(value)
            valueElm.append(a)
            break
        default:
            valueElm.append(value)
            break
        }
    }

    /**
     * @param {HTMLElement} valueElm
     * @param {Date} value
     * @param {String} type
     */
    #makeInstantValueElm = (valueElm, value, type) => {
        valueElm.classList.add(type)
        valueElm.append(format(value))

        function format (value) {
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
            const date = new Date(value)
            try {
                return `${date.toLocaleString(undefined, dateOptions)} ${date.toLocaleString(undefined, timeOptions)}`
            } catch (e) {
                return value
            }
        }
    }

    /**
     *  @param {HTMLElement} valueElm
     *  @param {String} value
     */
    #makeReferenceValueElm = (valueElm, value) => {
        valueElm.classList.add('reference')
        valueElm.append(format(value))

        function format (value) {
            let url = value.replace(`${context.server.url}`, '')
            if (!url.startsWith('/') && !url.startsWith('?')) url = `/${url}`
            const a = document.createElement('a')
            a.setAttribute('href', `#${url}`)
            a.append(value)
            return a
        }
    }

    /**
     *  @param {HTMLElement} valueElm
     *  @param {String} value
     */
    #makeUrlValueElm = (valueElm, value) => {
        valueElm.classList.add('url')
        valueElm.append(format(value))

        function format (value) {
            const a = document.createElement('a')
            a.setAttribute('href', `${value}`)
            a.setAttribute('target', '_blank')
            a.append(value)
            return a
        }
    }

    /**
     * @param {fhir4.Element[]} array
     * @param {String} type
     * @returns {HTMLDListElement}
     */
    #makeArrayElm = (array, type) => {
        const dl = document.createElement('dl')
        dl.append(...array.map((value, index) => {
            const valueElm = document.createElement('span')
            valueElm.classList.add('value')
            this.#makeValueElm(valueElm, value, type)

            const dt = document.createElement('dt')
            dt.append(
                this.#makeKeyElm(index),
                valueElm
            )
            return dt
        }))
        return dl
    }

    #downloadClick = () => {
        const content = JSON.stringify(this.#resource)
        const file = new File([content], this.resourceId, {
            type: 'data:text/json;charset=utf-8'
        })
        const url = URL.createObjectURL(file)
        const link = document.createElement('a')
        link.href = url
        link.download = `${this.resourceType}#${file.name}.json`
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    }

    #copyClick = () => {
        const content = JSON.stringify(this.#resource)
        navigator.clipboard.writeText(content).then(function () {
            snackbarService.info('Copying to clipboard was successful')
        }, function () {
            snackbarService.error('Could not copy text')
        })
    }

    #shareClick = () => {
        const content = JSON.stringify(this.#resource)
        const fileName = `${this.resourceType}.${this.resourceId}.txt`
        const file = new File([content], fileName, { type: 'text/plain' })
        navigator.share({
            title: fileName,
            files: [file]
        })
    }
};

customElements.define('resource-json-view', ResourceJsonView)
