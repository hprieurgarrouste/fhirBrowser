import template from './templates/M2SidePanel.html'

import './M2RoundButton'
import './M2AppBar'

export default class M2SidePanel extends HTMLElement {
    /** @type {HTMLHeadingElement} */
    #title

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#title = shadow.getElementById('title')
    }

    static get observedAttributes () { return ['data-title'] }

    attributeChangedCallback (name, oldValue, newValue) {
        if (name === 'data-title') {
            this.#title.innerText = newValue
        }
    }
};
window.customElements.define('m2-side-panel', M2SidePanel)
