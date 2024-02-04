import template from './templates/M2Button.html'

export default class M2Button extends HTMLElement {
    /** @type {HTMLButtonElement} */
    #input

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#input = shadow.querySelector('button')
    }

    static get observedAttributes () { return ['value', 'disabled'] }

    attributeChangedCallback (name, oldValue, newValue) {
        if (name === 'value') {
            this.#input.innerText = newValue
        } else if (name === 'disabled') {
            if (newValue === null) {
                this.#input.removeAttribute('disabled')
            } else {
                this.#input.setAttribute('disabled', '')
            }
        }
    }
}
window.customElements.define('m2-button', M2Button)
