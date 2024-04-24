import template from './templates/ResourceJsonView.html'

import M2Dialog from './components/M2Dialog'
import M2ButtonGroup from './components/M2ButtonGroup'
import M2RoundButton from './components/M2RoundButton'
import ResourceTemplateView from './ResourceTemplateView'

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
    /** @type {ResourceTemplateView} */
    #templateView
    /**
     * @type {Object}
     * @property {(raw|enhanced|template)} mode
     */
    #preferences
    #MODE = {
        raw: 'raw',
        object: 'object',
        template: 'template'
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

        if (false && !window.matchMedia('(max-width: 480px)').matches) { // WIP not available yet
            const btn = document.createElement('button')
            btn.title = 'Template'
            btn.innerText = 'wysiwyg'
            btn.setAttribute('data-id', 'template')
            this.#modeToggle.append(btn)
            this.#preferences.templateMode = false
        }
        this.#templateView = shadow.querySelector('resource-template-view')

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
        case 'template':
            this.#preferences.mode = this.#MODE.template
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
            this.#templateView.hidden = true
            this.#sortToggle.hidden = true
            break
        case this.#MODE.object:
            this.#content.hidden = false
            this.#templateView.hidden = true
            this.#sortToggle.hidden = false
            break
        case this.#MODE.template:
            this.#content.hidden = true
            this.#templateView.hidden = false
            this.#sortToggle.hidden = true
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
            context.server.structureDefinition(resource.resourceType).then(sd => {
                const valueElm = document.createElement('span')
                valueElm.classList.add('value', 'object', sd.id)
                valueElm.append(...this.#makeObjectElm(resource, sd))
                const dt = document.createElement('DT')
                dt.append(valueElm)
                const dl = document.createElement('DL')
                dl.append(dt)
                this.#content.append(dl)
                // this.#content.append('{', this.#makeObjectElm(resource, sd), '}');
            })
        }
        this.#content.style.cursor = 'default'
        this.#resource = resource
        this.#templateView.source = resource
    }

    /**
     * @param {fhir4.StructureDefinition} structureDefinition
     * @param {string} id
     * @returns {fhir4.ElementDefinition}
     */
    #resolveType = async (structureDefinition, id) => {
        let baseType = {
            id: `${structureDefinition.id}.${id}`,
            type: [{ code: 'string' }]
        }
        const prop = structureDefinition.snapshot.element.find(e => e.id === `${structureDefinition.id}.${id}`)
        if (prop?.type) {
            baseType = prop // prop.type[0].code;
        } else if (prop?.base) {
            const baseRoot = prop.base.path.split('.').at(0)
            const baseSd = await context.server.structureDefinition(baseRoot)
            baseType = this.#resolveType(baseSd, prop.base.path)
        }
        return baseType
    }

    /**
     * @param {object} obj
     * @param {fhir4.StructureDefinition} structureDefinition
     * @returns {HTMLElement[]}
     */
    #makeObjectElm = (obj, structureDefinition) => {
        const ret = []
        if (structureDefinition.id === 'Address') {
            const btn = this.#makeAddressValueBtn(obj, structureDefinition)
            if (btn) ret.push(btn)
        } else if (['Binary', 'Attachment'].includes(structureDefinition.id)) {
            const btn = this.#makeAttachmentValueBtn(obj, structureDefinition)
            if (btn) ret.push(btn)
        }

        let entries = Object.entries(obj)
        if (this.#preferences.sortMode) entries = entries.sort()

        /** @type {HTMLDListElement} */
        const dl = document.createElement('dl')
        dl.append(...entries.map(([key, value]) => {
            const valueElm = document.createElement('span')
            valueElm.classList.add('value')
            if (structureDefinition.id === 'Reference' && key === 'reference') {
                this.#makeReferenceValueElm(valueElm, obj, value)
            } else if (structureDefinition.id === 'ContactPoint' && key === 'value') {
                this.#makeContactPointValueElm(valueElm, obj, value)
            } else {
                this.#resolveType(structureDefinition, key).then(elementDefinition => {
                    const propType = elementDefinition.type[0].code
                    if (elementDefinition.type.length > 1) {
                        console.log('TYPE LENGTH!!!')
                    }
                    if (['instant', 'dateTime'].includes(propType)) {
                        this.#makeInstantValueElm(valueElm, value)
                        // TODO
                        // } else if ('Narrative' == propType) {
                        //    this.#makeNarrativeValueElm(valueElm, value, prop);
                    } else {
                        this.#makeValueElm(valueElm, value, elementDefinition, structureDefinition)
                    }
                })
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
     * @param {fhir4.ElementDefinition} elementDefinition
     * @param {fhir4.StructureDefinition} structureDefinition
     */
    #makeValueElm = (valueElm, value, elementDefinition, structureDefinition) => {
        if (value === null) {
            valueElm.append('null')
        } else if (elementDefinition?.type[0]?.code) {
            const propType = elementDefinition.type[0].code
            if (Array.isArray(value)) { // Array
                valueElm.classList.add('array', propType)
                valueElm.append(this.#makeArrayElm(value, elementDefinition, structureDefinition))
            } else if (typeof value === 'object') { // Object
                valueElm.classList.add('object', propType)
                if (propType === 'BackboneElement') {
                    console.log('backbone')
                    const besd = this.#extractBackboneElement(structureDefinition, elementDefinition.id)
                    valueElm.append(...this.#makeObjectElm(value, besd))
                } else {
                    context.server.structureDefinition(propType).then(sd => {
                        valueElm.append(...this.#makeObjectElm(value, sd))
                    })
                }
            } else {
                valueElm.classList.add(propType)
                valueElm.append(value)
            }
        } else {
            valueElm.append(value)
        }
    }

    #extractBackboneElement = (structureDefinition, prefix) => {
        const backboneElement = []
        structureDefinition.snapshot.element.filter(e => e.id.startsWith(prefix)).forEach(e => backboneElement.push(e))
        return {
            resourceType: 'StructureDefinition',
            id: prefix,
            snapshot: {
                element: backboneElement
            }
        }
    }

    /**
     * @param {HTMLElement} valueElm
     * @param {fhir4.Attachment} attachment
     * @param {fhir4.StructureDefinition} structureDefinition
     */
    #makeAttachmentValueBtn = (attachment, structureDefinition) => {
        if (attachment.contentType && attachment.data) {
            const btn = document.createElement('i')
            btn.className = 'material-symbols-sharp'
            btn.innerText = 'open_in_new'
            btn.title = 'View'
            btn.onclick = () => { window.open(makeJson(), '_blank') }
            return btn
        }

        function makeJson () {
            const contentType = attachment.contentType
            const byteCharacters = atob(attachment.data)
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
    #makeAddressValueBtn = (address, structureDefinition) => {
        let query = ''
        address.line.forEach(l => { query += ` ${l}` })
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

    #makeNarrativeValueElm = (valueElm, value, sd) => {
        if (value.div) {
            const btn = document.createElement('i')
            btn.className = 'material-symbols-sharp'
            btn.innerText = 'pageview'
            btn.title = 'Preview'
            btn.onclick = () => { this.#narrativeDialog(value.div) }
            valueElm.append(btn)
        }
        this.#makeValueElm(valueElm, value, sd)
    }

    #narrativeDialog = (xhtml) => {
        /** @type {M2Dialog} */
        const previewDialog = new M2Dialog('Preview')
        previewDialog.fullscreen = true
        previewDialog.centered = true
        previewDialog.onClose = () => {
            previewDialog.remove()
        }

        const closeBtn = new M2RoundButton('close', 'Close')
        closeBtn.slot = 'appBarLeft'
        closeBtn.onclick = previewDialog.onClose
        previewDialog.append(closeBtn)

        const p = document.createElement('p')
        p.className = 'Narrative'
        p.innerHTML = xhtml
        previewDialog.append(p)

        context.appContainer.append(previewDialog)
    }

    /**
     * @param {HTMLElement} valueElm
     * @param {Date} value
     */
    #makeInstantValueElm = (valueElm, value) => {
        valueElm.classList.add('instant')
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
     *  @param {fhir4.Reference} reference
     *  @param {String} value
     */
    #makeReferenceValueElm = (valueElm, reference, value) => {
        valueElm.classList.add('href')
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
     * @param {fhir4.Element[]} array
     * @param {fhir4.ElementDefinition} elementDefinition
     * @param {fhir4.StructureDefinition} structureDefinition
     * @returns {HTMLDListElement}
     */
    #makeArrayElm = (array, elementDefinition, structureDefinition) => {
        const dl = document.createElement('dl')
        dl.append(...array.map((value, index) => {
            const valueElm = document.createElement('span')
            valueElm.classList.add('value')
            this.#makeValueElm(valueElm, value, elementDefinition, structureDefinition)

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
            snackbarService.show('Copying to clipboard was successful')
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
