import template from './templates/BundleSearchModifier.html'

export default class BundleSearchModifier extends HTMLElement {
    /** @type {HTMLInputElement} */
    #input

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#input = shadow.querySelector('input')
    }

    get value () {
        return this.#input.value
    }

    set value (newValue) {
        this.#input.value = newValue
    }
};
customElements.define('bundle-search-modifier', BundleSearchModifier)
