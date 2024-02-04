import template from './templates/M2ListRow.html'

export default class M2ListRow extends HTMLElement {
    /** @type {HTMLElement} */
    #main

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#main = shadow.querySelector('main')
    }

    static get observedAttributes () { return ['selected'] }

    attributeChangedCallback (name, oldValue, newValue) {
        if (name === 'selected') {
            if (newValue === null) {
                this.#main.removeAttribute('selected')
            } else {
                this.#main.setAttribute('selected', '')
            }
        }
    }
};
customElements.define('m2-list-row', M2ListRow)
