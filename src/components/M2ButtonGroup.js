import template from './templates/M2ButtonGroup.html'

export default class M2ButtonGroup extends HTMLElement {
    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        shadow.querySelector('main').onclick = this.#onClick
    }

    #onClick = (event) => {
        /** @type {HTMLButtonElement} */
        const target = event.target.closest('button')
        if (target) {
            this.value = target.dataset.id
        }
    }

    get value () {
        return this.querySelector('button[selected]')?.dataset.id
    }

    set value (id) {
        this.querySelector('button[selected]')?.removeAttribute('selected')
        const target = this.querySelector(`button[data-id='${id}']`)
        if (target) target.setAttribute('selected', '')
    }
};

customElements.define('m2-button-group', M2ButtonGroup)
