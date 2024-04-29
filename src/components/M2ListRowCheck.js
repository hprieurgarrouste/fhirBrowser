import template from './templates/M2ListRowCheck.html'

export default class M2ListRowCheck extends HTMLElement {
    /** @param {HTMLInputElement} */
    #checkbox

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        shadow.querySelector('main').onclick = this.#clickHandler
        this.#checkbox = shadow.querySelector('input[type=checkbox]')
    }

    static get observedAttributes () { return ['selected'] }

    attributeChangedCallback (name, oldValue, newValue) {
        if (name === 'selected') {
            this.#checkbox.checked = (newValue !== null)
        }
    }

    #clickHandler = (event) => {
        if (this.getAttribute('selected') !== null) {
            this.removeAttribute('selected')
        } else {
            this.setAttribute('selected', '')
        }
    }
};

customElements.define('m2-list-row-check', M2ListRowCheck)
