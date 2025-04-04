import template from './templates/M2Snackbar.html'

export default class M2Snackbar extends HTMLElement {
    /** @type {HTMLElement} */
    #main

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#main = shadow.querySelector('main')
    }

    /**
     * Set the snackbar css style
     * @param {{'info':'error'}} [type='info'] - notification color, default 'info'
     */
    set type(type = 'info') {
        this.#main.classList.remove('info','error')
        this.#main.classList.add(type)
    }
};
customElements.define('m2-snackbar', M2Snackbar)
