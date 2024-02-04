import template from './templates/M2RoundButton.html'

export default class M2RoundButton extends HTMLElement {
    /** @type {HTMLButtonElement} */
    #main

    /**
     *
     * @param {String} icon Name of the icon
     */
    constructor (icon, title) {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#main = shadow.querySelector('button')
        if (icon) this.icon = icon
        if (title) this.title = title
    }

    static get observedAttributes () { return ['data-icon', 'disabled'] }

    attributeChangedCallback (name, oldValue, newValue) {
        if (name === 'data-icon') {
            this.#main.innerText = newValue
        } else if (name === 'disabled') {
            if (newValue === null) {
                this.#main.removeAttribute('disabled')
            } else {
                this.#main.setAttribute('disabled', '')
            }
        }
    }

    get icon () {
        return this.getAttribute('data-icon')
    }

    /** @param {String} name */
    set icon (name) {
        this.setAttribute('data-icon', name)
    }
}
customElements.define('m2-round-button', M2RoundButton)
