import template from './templates/M2ListFilter.html'

export default class M2ListFilter extends HTMLElement {
    /** @type {HTMLInputElement} */
    #text
    /** @type {HTMLElement} */
    #case
    /** @type {String} */

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template

        this.#text = shadow.getElementById('text')
        this.#text.addEventListener('input', this.#onchangeDispatcher)

        shadow.querySelector('main').addEventListener('mousedown', (event) => {
            this.#text.focus()
        })

        shadow.getElementById('clear').onclick = this.#clearClick

        this.#case = shadow.getElementById('case')
        this.#case.onclick = this.#caseClick
    }

    clear () {
        this.#clearClick()
    }

    #clearClick = () => {
        if (this.#text.value) {
            this.#text.value = ''
            this.#onchangeDispatcher()
        }
    }

    #caseClick = () => {
        this.#case.classList.toggle('selected')
        this.#onchangeDispatcher()
    }

    #onchangeDispatcher = () => {
        this.#onChange({
            value: this.#text.value,
            caseSensitive: this.#case.classList.contains('selected')
        })
    }

    #onChange = () => { }
    get onChange () {
        return this.#onChange
    }

    set onChange (changeFct) {
        this.#onChange = changeFct
    }
};

customElements.define('m2-list-filter', M2ListFilter)
