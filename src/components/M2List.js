import template from './templates/M2List.html'

import './M2ListFilter'

export default class M2List extends HTMLElement {
    /** @type {M2ListFilter} */
    #filter
    /** @type {HTMLElement} */
    #list
    /** @type {HTMLSlotElement} */
    #slot

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#list = shadow.getElementById('list')
        this.#slot = shadow.querySelector('slot')
        this.#slot.addEventListener('slotchange', this.#slotChange)
        this.#filter = shadow.querySelector('m2-list-filter')
        this.#filter.onChange = this.#filterChange
    }

    connectedCallback () {
        this.#filter.hidden = (this.#slot.children.length <= 10)
    }

    #onFilter = (value) => { }
    get onFilter () {
        return this.#onFilter
    }

    set onFilter (filterFct) {
        this.#onFilter = filterFct
    }

    #filterChange = (value) => {
        if (value === '') this.#list.scrollTop = 0
        this.#onFilter(value)
    }

    #slotChange = () => {
        this.#filter.hidden = ((typeof this.#onFilter !== 'function') || this.#slot.assignedNodes().length <= 10)
    }

    clear = () => {
        this.#slot.assignedNodes().forEach(e => this.removeChild(e))
        this.#filter.clear()
        this.#list.scrollTop = 0
    }
};

customElements.define('m2-list', M2List)
