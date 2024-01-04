import template from "./templates/M2Badge.html"

class M2Badge extends HTMLElement {
    /** @type {HTMLElement} */
    #content = null;
    /** @type {number} */
    #value = null;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template;
        this.#content = shadow.querySelector("main");
        this.#value = null;
    }

    connectedCallback() {
        this.#render();
    }

    #render = () => {
        if (!this.#content) return;
        if (this.#value == null || this.#value == undefined || this.#value.length == 0) {
            this.#content.innerText = '?';
            this.title = this.#value;
            return;
        }
        const formatted = formatNumber(this.#value);
        this.#content.innerText = formatted;
        this.title = (this.#value != formatted) ? this.#value : '';

        function formatNumber(num, precision = 0) {
            const map = [
                { suffix: 'T', threshold: 1e12 },
                { suffix: 'B', threshold: 1e9 },
                { suffix: 'M', threshold: 1e6 },
                { suffix: 'K', threshold: 1e3 },
                { suffix: '', threshold: 1 },
            ];

            const found = map.find((x) => Math.abs(num) >= x.threshold);
            if (found) {
                const formatted = (num / found.threshold).toFixed(precision) + found.suffix;
                return formatted;
            }
            return num;
        }
    }

    get value() {
        return this.#value;
    }
    /**
     * @param {number} value
     */
    set value(value) {
        this.#value = value;
        this.#render();
    }
}
window.customElements.define('m2-badge', M2Badge);
