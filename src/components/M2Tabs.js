import template from "./templates/M2Tabs.html"

class M2Tabs extends HTMLElement {
    /** @type {HTMLElement} */
    #header;
    /** @type {HTMLSlotElement} */
    #slot;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;
        shadow.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
        }

        this.#header = shadow.querySelector('header');
        this.#header.onclick = this.#headerClick;

        this.#slot = shadow.querySelector('slot');
        this.#slot.addEventListener('slotchange', this.#slotChanged);
    }

    #clear = () => {
        while (this.#header.firstChild) this.#header.removeChild(this.#header.lastChild);
    }

    #slotChanged = () => {
        this.#clear();
        this.#slot.assignedElements()
            .forEach((slotted) => {
                slotted.hidden = true;
                const appTab = document.createElement('section');
                appTab.dataset.caption = slotted.dataset.caption;
                appTab.innerText = slotted.dataset.caption;
                this.#header.appendChild(appTab);
            });
        if (!this.value) {
            this.value = this.#header.querySelector(`section:nth-child(1)`)?.dataset.caption;
        }
    }

    #headerClick = ({ target }) => {
        this.value = target.dataset.caption;
        this.dispatchEvent(new CustomEvent("select", {
            bubbles: false,
            cancelable: false,
            'detail': {
                'caption': this.value
            }
        }));
    }

    get value() {
        return this.#header.querySelector('section[selected]')?.dataset?.caption;
    }

    set value(caption) {
        this.#header.querySelector('section[selected]')?.removeAttribute('selected');
        this.#slot.assignedElements().forEach((slotted, index) => {
            if (slotted.dataset.caption == caption) {
                slotted.hidden = false;
                this.#header.querySelector(`section:nth-child(${index + 1})`)?.setAttribute('selected', '');
            } else {
                slotted.hidden = true;
            }
        })
    }

};

customElements.define('m2-tabs', M2Tabs)

