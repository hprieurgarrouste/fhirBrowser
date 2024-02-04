import template from './templates/ResourceTemplateEditor.html'

import './components/M2SidePanel'

import context from './services/Context'
import M2List from './components/M2List'
import M2ListItem from './components/M2ListItem'
import M2ListRow from './components/M2ListRow'
import M2TextField from './components/M2TextField'

export default class ResourceTemplateEditor extends HTMLElement {
    /** @type {ShadowRoot} */
    #shadow
    /** @type {M2List} */
    #list
    /** @type {HTMLElement} */
    #dragSrcEl
    /** @type {HTMLElement} */
    #template
    /** @type {Fhir.Resource} */
    #resource

    constructor () {
        super()
        this.#shadow = this.attachShadow({ mode: 'closed' })
        this.#shadow.innerHTML = template

        this.#template = this.#shadow.getElementById('template')

        this.#list = this.#shadow.querySelector('m2-list')
        this.#list.onFilter = this.#dataListFilter

        const dragZone = this.#shadow.querySelector('main')
        dragZone.ondragstart = this.#onDragStart
        dragZone.ondragover = this.#onDragOver
        dragZone.ondragenter = this.#onDragEnter
        dragZone.ondragleave = this.#onDragLeave
        dragZone.ondragend = this.#onDragEnd
        dragZone.ondrop = this.#onDragDrop
    }

    #dataListFilter = (value) => {
        const filter = value.toLowerCase()
        this.#list.childNodes.forEach(row => {
            row.hidden = !row.dataset.id.toLowerCase().includes(filter)
        })
    }

    #clear = () => {
        while (this.#template.firstChild) this.#template.removeChild(this.#template.lastChild)
    }

    #buildTemplate = (template) => {
        this.#clear()
        template.forEach(section => {
            const fieldset = this.#createFieldset(section.label)
            section.row.forEach(row => {
                const section = this.#createSection()
                row.forEach(field => {
                    section.appendChild(this.#createField(field.name, field.placeholder))
                })
                fieldset.appendChild(section)
            })
            this.#template.appendChild(fieldset)
        })
    }

    #createFieldset = (name = 'unamed') => {
        const fieldset = document.createElement('fieldset')
        fieldset.setAttribute('draggable', 'true')
        const label = document.createElement('input')
        label.setAttribute('spellcheck', 'false')
        label.type = 'text'
        label.classList.add('label')
        label.value = name
        fieldset.appendChild(label)
        return fieldset
    }

    #createSection = () => {
        const section = document.createElement('section')
        section.setAttribute('draggable', 'true')
        return section
    }

    #createField = (name, placeholder) => {
        const textField = new M2TextField()
        textField.id = name
        textField.setAttribute('placeholder', placeholder)
        textField.setAttribute('readonly', '')
        textField.setAttribute('draggable', 'true')
        return textField
    }

    #setValues = (resource) => {
        const fields = Array.from(this.#shadow.querySelectorAll('m2-textfield'))
        fields.forEach(field => {
            let value = ''
            if (field.id) {
                value = this.#calcValue(resource, field.id)
            }
            field.setAttribute('value', value)
        })
    }

    #calcValue = (resource, id) => {
        let value = resource
        const path = id.split('.')
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
        return value || ''
    }

    get source () {
        return this.#resource
    }

    /**
     * @param {Fhir.Resource} resource
     */
    set source (resource) {
        this.#resource = resource
        this.#loadData(resource.resourceType)
        this.#setValues(resource)
    }

    set template (tpl) {
        if (tpl) {
            this.#buildTemplate(tpl)
            this.#cleanEmpty()
        } else {
            this.#clear()
        }
    }

    get template () {
        const ret = []
        Array.from(this.#template.childNodes)
            .filter(node => node.localName === 'fieldset')
            .forEach(fieldset => ret.push(parseFieldset(fieldset)))
        return ret

        function parseFieldset (fieldset) {
            const fs = {
                label: '',
                row: []
            }
            Array.from(fieldset.childNodes).forEach(node => {
                if (node.localName === 'input') {
                    fs.label = node.value
                } else if (node.localName === 'section') {
                    fs.row.push(parseSection(node))
                }
            })
            return fs
        }
        function parseSection (section) {
            const ret = []
            Array.from(section.childNodes)
                .filter(node => node.localName === 'm2-textfield')
                .forEach(node => ret.push(parseField(node)))
            return ret
        }
        function parseField (textField) {
            return {
                placeholder: textField.getAttribute('placeholder'),
                name: textField.id
            }
        }
    }

    #loadData = (resourceType) => {
        this.#list.clear()

        this.#shadow.querySelector('m2-linear-progress').hidden = false
        this.#sdParse(resourceType, '').then((elements) => {
            elements
                .sort((e1, e2) => e1.path.localeCompare(e2.path))
                .forEach(element => this.#list.appendChild(this.#makeRow(element)))
            this.#shadow.querySelector('m2-linear-progress').hidden = true
        })
    }

    #makeRow = (element) => {
        const item = new M2ListItem()
        item.setAttribute('data-icon', 'drag_indicator')
        item.setAttribute('data-primary', element.path)
        item.setAttribute('data-secondary', element.short)
        const row = new M2ListRow()
        row.setAttribute('draggable', 'true')
        row.setAttribute('data-id', element.id)
        row.appendChild(item)
        return row
    }

    #sdParse = (resourceType, path) => {
        return new Promise((resolve) => {
            const elements = []
            context.server.structureDefinition(resourceType).then((structureDefinition) => {
                const subPromises = []
                structureDefinition.snapshot.element
                    .filter(e => e.type)
                    .forEach((element) => {
                        const elementName = element.path.substr(element.path.indexOf('.') + 1)
                        // avoid infinite loops
                        if (!path.includes(`${elementName}.`)) {
                            const newPath = (path ? `${path}.` : '') + elementName
                            const type = element.type[0].code
                            const isClass = type.match(/^([A-Z][a-z]+)+$/)
                            if (isClass) {
                                subPromises.push(this.#sdParse(type, newPath))
                            } else {
                                elements.push({
                                    id: newPath,
                                    path: newPath,
                                    short: element.short,
                                    type
                                })
                            }
                        }
                    })
                if (subPromises.length > 0) {
                    Promise.all(subPromises).then((values) => {
                        values.forEach(value => elements.push(...value))
                        resolve(elements)
                    })
                } else {
                    resolve(elements)
                }
            })
        })
    }

    #cleanEmpty = () => {
        Array.from(this.#template.querySelectorAll('section:not(:has(m2-textfield))')).forEach(e => e.remove())
        Array.from(this.#template.querySelectorAll('fieldset:not(:has(section))')).forEach(e => e.remove())
    }

    #isDropAvailable = (src, target) => {
        return (src !== target) &&
            (
                (target.id === 'template') ||
                (target.closest('#template') == null) ||
                (src.localName === 'fieldset' && (
                    target.id === 'template' ||
                    target.localName === 'fieldset'
                )) ||
                (src.localName === 'section' && (
                    target.id === 'template' ||
                    target.localName === 'fieldset' ||
                    target.localName === 'section'
                )) ||
                (src.localName === 'm2-textfield' && (
                    target.id === 'template' ||
                    target.localName === 'fieldset' ||
                    target.localName === 'section' ||
                    target.localName === 'm2-textfield'
                )) ||
                (src.localName === 'm2-list-row' && (
                    target.id === 'template' ||
                    target.localName === 'fieldset' ||
                    target.localName === 'section' ||
                    target.localName === 'm2-textfield'
                ))
            )
    }

    #onDragStart = (event) => {
        this.#template.classList.add('drag')
        this.#dragSrcEl = event.target
        this.#dragSrcEl.style.opacity = '0.4'
    }

    #onDragEnter = (event) => {
        event.target?.classList.add('over')
    }

    #onDragLeave = (event) => {
        event.target?.classList.remove('over')
    }

    #onDragOver = (event) => {
        event.preventDefault()
        if (this.#isDropAvailable(this.#dragSrcEl, event.target)) {
            event.dataTransfer.dropEffect = 'move'
        } else {
            event.dataTransfer.dropEffect = 'none'
        }
        return false
    }

    #onDragDrop = (event) => {
        event.stopPropagation()
        let target = event.target
        let src = this.#dragSrcEl
        if (this.#isDropAvailable(this.#dragSrcEl, target)) {
            if (target.closest('#template') == null) {
                this.#dragSrcEl.remove()
            } else {
                if (this.#dragSrcEl.parentNode === target.parentNode) {
                    const thArr = Array.from(target.parentNode.childNodes)
                    const srcIdx = thArr.findIndex(th => th === this.#dragSrcEl)
                    const tgtIdx = thArr.findIndex(th => th === target)

                    if (srcIdx < tgtIdx) {
                        target = target.nextSibling
                    }
                }

                if (src.localName === 'm2-list-row') {
                    const id = this.#dragSrcEl.dataset.id
                    src = this.#createField(id, id.split('.').pop())
                    src.setAttribute('value', this.#calcValue(this.#resource, id))
                    if (target.id === 'template') {
                        const section = this.#createSection()
                        section.appendChild(src)
                        const fieldset = this.#createFieldset()
                        fieldset.appendChild(section)
                        target.appendChild(fieldset)
                    } else if (target.localName === 'fieldset') {
                        const section = this.#createSection()
                        section.appendChild(src)
                        target.appendChild(section)
                    } else if (target.localName === 'section') {
                        target.appendChild(src)
                    } else if (target.localName === 'm2-textfield') {
                        target.parentNode.insertBefore(src, target)
                    }
                } else if (src.localName === 'fieldset') {
                    if (target.id === 'template') {
                        target.appendChild(src)
                    } else if (target.localName === 'fieldset') {
                        target.parentNode.insertBefore(src, target)
                    }
                } else if (src.localName === 'section') {
                    if (target.id === 'template') {
                        const fieldset = this.#createFieldset()
                        fieldset.appendChild(src)
                        target.appendChild(fieldset)
                    } else if (target.localName === 'fieldset') {
                        target.appendChild(src)
                    } else if (target.localName === 'section') {
                        target.parentNode.insertBefore(src, target)
                    }
                } else if (src.localName === 'm2-textfield') {
                    if (target.id === 'template') {
                        const section = this.#createSection()
                        section.appendChild(src)
                        const fieldset = this.#createFieldset()
                        fieldset.appendChild(section)
                        target.appendChild(fieldset)
                    } else if (target.localName === 'fieldset') {
                        const section = this.#createSection()
                        section.appendChild(src)
                        target.appendChild(section)
                    } else if (target.localName === 'section') {
                        target.appendChild(src)
                    } else if (target.localName === 'm2-textfield') {
                        target.parentNode.insertBefore(src, target)
                    }
                }
            }
            this.#cleanEmpty()
        }

        return false
    }

    #onDragEnd = (event) => {
        this.#dragSrcEl.style.opacity = '1'
        this.#dragSrcEl = null
        this.#template.classList.remove('drag')
        this.#template.querySelectorAll('[class~="over"]').forEach(e => e.classList.remove('over'))
    }
};
customElements.define('resource-template-editor', ResourceTemplateEditor)
