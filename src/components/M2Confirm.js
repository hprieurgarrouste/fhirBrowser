import template from './templates/M2Confirm.html'

export default class M2Confirm extends HTMLElement {
    /** @type {HTMLHeadingElement} */
    #title
    /** @type {M2Button} */
    #btnOk

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template

        shadow.querySelector('main').onclick = this.#onClose
        shadow.querySelector('.surface').onclick = (event) => event.stopPropagation()

        this.#title = shadow.querySelector('h2')

        this.#btnOk = shadow.getElementById('btnOk')
        this.#btnOk.onclick = this.#validateClick

        shadow.getElementById('btnCancel').onclick = this.#onClose
    }

    #onClose = (event) => {
        this.hidden = true
    }

    #validateClick = (event) => {
        this.onValidate(event)
        this.hidden = true
    }

    #onValidate = (event) => { }
    get onValidate () {
        return this.#onValidate
    }

    set onValidate (validateFct) {
        this.#onValidate = validateFct
    }

    static get observedAttributes () { return ['data-title', 'data-ok-text'] }

    attributeChangedCallback (name, oldValue, newValue) {
        if (name === 'data-title') {
            this.#title.innerText = newValue
        } else if (name === 'data-ok-text') {
            this.#btnOk.setAttribute('value', newValue)
        }
    }
};
window.customElements.define('m2-confirm', M2Confirm)
