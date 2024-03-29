import template from './templates/M2TextField.html'

export default class M2TextField extends HTMLElement {
    /** @type {HTMLLabelElement} */
    #label
    /** @type {HTMLInputElement} */
    #input
    /** @type {HTMLElement} */
    #helper

    /** @type {string} */
    #labelInnerText

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#label = shadow.querySelector('label')
        this.#labelInnerText = ''
        this.#input = shadow.querySelector('input')
        this.#helper = shadow.getElementById('helper')
    }

    static get observedAttributes () { return ['type', 'pattern', 'placeholder', 'readonly', 'required', 'value', 'helper'] }

    attributeChangedCallback (name, oldValue, newValue) {
        switch (name) {
        case 'type':
            this.#input.setAttribute('type', newValue)
            break
        case 'pattern':
            this.#input.setAttribute('pattern', newValue)
            break
        case 'placeholder':
            this.#labelInnerText = newValue
            this.#input.setAttribute('placeholder', newValue)
            this.#label.innerText = newValue
            break
        case 'readonly':
        case 'required':
            if (newValue == null) {
                this.#input.removeAttribute(name)
            } else {
                this.#input.setAttribute(name, '')
            }
            break
        case 'value':
            this.#input.setAttribute('value', newValue)
            break
        case 'helper':
            this.#helper.innerText = newValue
            break
        }
        // css input:required::placeholder::after dont work :(
        if (this.#input.hasAttribute('required')) {
            this.#input.setAttribute('placeholder', `${this.#labelInnerText}*`)
        }
    }

    checkValidity = function () {
        return this.#input.checkValidity()
    }

    focus = function () {
        this.#input.focus()
    }

    get value () {
        return this.#input.value
    }

    set value (newValue) {
        this.#input.value = newValue
    }
};
window.customElements.define('m2-textfield', M2TextField)
