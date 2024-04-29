import template from './templates/M2Avatar.html'

export default class M2Avatar extends HTMLElement {
    /** @type {HTMLElement} */
    #main

    constructor (icon) {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#main = shadow.querySelector('main')
        if (icon) this.icon = icon
    }

    static get observedAttributes () { return ['data-icon'] }

    attributeChangedCallback (name, oldValue, newValue) {
        if (name === 'data-icon') {
            this.#main.innerText = newValue
        }
    }

    get icon () {
        return this.getAttribute('data-icon')
    }

    /** @param {String} name */
    set icon (name) {
        this.setAttribute('data-icon', name)
    }
};
window.customElements.define('m2-avatar', M2Avatar)
