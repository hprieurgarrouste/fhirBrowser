import template from './templates/M2Waiting.html'
import './M2CircularProgress'

export default class M2Waiting extends HTMLElement {
    /** @type {HTMLDialogElement} */
    #dialog

    constructor () {
        super()
         const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#dialog = shadow.querySelector('dialog')
    }

    show() {
        this.#dialog.showModal()
    }
    hide() {
        this.#dialog.close()
    }
}
customElements.define('m2-waiting', M2Waiting)
