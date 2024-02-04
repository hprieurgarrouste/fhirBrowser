import template from './templates/M2Dialog.html'

export default class M2Dialog extends HTMLElement {
    /** @type {HTMLDivElement} */
    #surface
    /** @type {HTMLHeadingElement} */
    #title

    constructor (title) {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template

        shadow.querySelector('main').addEventListener('click', (event) => this.onClose(event))

        this.#surface = shadow.querySelector('.surface')
        this.#surface.addEventListener('click', (event) => event.stopPropagation())

        this.#title = shadow.getElementById('title')
        if (title) this.title = title
    }

    connectedCallback () {
        window.addEventListener('hashchange', (event) => this.onClose(event))
    }

    #onClose = () => {
        this.hidden = true
    }

    get onClose () {
        return this.#onClose
    }

    /**
     * @param {Function} closeFct - Callback function
     */
    set onClose (closeFct) {
        this.#onClose = closeFct
    }

    static get observedAttributes () { return ['data-title', 'centered', 'fullscreen'] }

    attributeChangedCallback (name, oldValue, newValue) {
        if (name === 'centered') {
            this.#surface.classList.add('centered')
        } else if (name === 'fullscreen') {
            this.#surface.classList.add('fullscreen')
        } else if (name === 'data-title') {
            this.#title.innerText = newValue
        }
    }

    /**
     * @param {string} title
     */
    set title (title) {
        this.setAttribute('data-title', title)
    }

    get title () {
        return this.getAttribute('data-title')
    }

    /**
     * @param {boolean} bool
     */
    set fullscreen (bool) {
        if (bool) {
            this.setAttribute('fullscreen', '')
        } else {
            this.removeAttribute('fullscreen')
        }
    }

    get fullscreen () {
        return this.hasAttribute('fullscreen')
    }

    /**
     * @param {boolean} bool
     */
    set centered (bool) {
        if (bool) {
            this.setAttribute('centered', '')
        } else {
            this.removeAttribute('centered')
        }
    }

    get centered () {
        return this.hasAttribute('centered')
    }
};
window.customElements.define('m2-dialog', M2Dialog)
