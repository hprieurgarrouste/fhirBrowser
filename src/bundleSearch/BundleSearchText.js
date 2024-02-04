import template from './templates/BundleSearchText.html'

export default class BundleSearchText extends HTMLElement {
    /** @type {HTMLInputElement} */
    #input

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#input = shadow.querySelector('input')
    }

    static get observedAttributes () { return ['placeholder'] }

    attributeChangedCallback (name, oldValue, newValue) {
        if (name === 'placeholder') {
            this.#input.setAttribute('placeholder', newValue)
        }
    }

    get value () {
        return this.#input.value
    }

    set value (newValue) {
        this.#input.value = newValue
    }
};
customElements.define('bundle-search-text', BundleSearchText)
