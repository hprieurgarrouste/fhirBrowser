import template from './templates/M2ListFilter.html'

export default class M2ListFilter extends HTMLElement {
    /** @type {HTMLInputElement} */
    #text

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template

        this.#text = shadow.getElementById('text')
        this.#text.addEventListener('input', () => {
            this.#onChange(this.#text.value)
        })

        shadow.querySelector('main').addEventListener('mousedown', (event) => {
            this.#text.focus()
        })

        shadow.getElementById('clear').onclick = this.#clearClick
    }

    #clearClick = () => {
        if (this.#text.value) {
            this.#text.value = ''
            this.#onChange(this.#text.value)
        }
    }

    clear () {
        this.#clearClick()
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
