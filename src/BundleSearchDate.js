import template from "./templates/BundleSearchDate.html";

class BundleSearchDate extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template;
        this._date = shadow.querySelector('input[type="date"]');
        this._time = shadow.querySelector('input[type="time"]');
    }

    get value() {
        if (this._date.value) {
            let dte = new Date(`${this._date.value}T${this._time.value || '00:00'}`);
            return new Date(dte.getTime()).toISOString();
        }
        return null;
    }
    set value(newValue) {
        //todo
        this._date.value = "";
        this._time.value = "";
    }
};
customElements.define('bundle-search-date', BundleSearchDate)
