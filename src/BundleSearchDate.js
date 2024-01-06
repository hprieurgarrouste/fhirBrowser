import template from "./templates/BundleSearchDate.html";

export default class BundleSearchDate extends HTMLElement {
    /** @type {HTMLInputElement} */
    #date;
    /** @type {HTMLInputElement} */
    #time;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template;
        this.#date = shadow.querySelector('input[type="date"]');
        this.#time = shadow.querySelector('input[type="time"]');
    }

    get value() {
        if (this.#date.value) {
            let dte = new Date(`${this.#date.value}T${this.#time.value || '00:00'}`);
            return new Date(dte.getTime()).toISOString();
        }
        return null;
    }
    set value(newValue) {
        //todo
        this.#date.value = "";
        this.#time.value = "";
    }
};
customElements.define('bundle-search-date', BundleSearchDate)
