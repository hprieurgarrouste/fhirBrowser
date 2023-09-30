import template from "./templates/fhirSearchDate.html";

(function () {
    class FhirSearchDate extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' })
            this._shadow.innerHTML = template;
        }

        get value() {
            const date = this._shadow.querySelector('input[type="date"]');
            if (date.value) {
                const time = this._shadow.querySelector('input[type="time"]');
                let dte = new Date(`${date.value}T${time.value || '00:00'}`);
                return new Date(dte.getTime()).toISOString();
            }
            return null;
        }
        set value(newValue) {
            //todo
            this._shadow.querySelector('input[type="date"]').value = "";
            this._shadow.querySelector('input[type="time"]').value = "";
        }
    };
    customElements.define('fhir-search-date', FhirSearchDate)
})();
