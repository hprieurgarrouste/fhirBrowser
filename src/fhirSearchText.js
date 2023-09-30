import template from "./templates/fhirSearchText.html";

(function () {
    class FhirSearchText extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' })
            this._shadow.innerHTML = template;
        }

        connectedCallback() {
            let placeholder = this.getAttribute("placeholder");
            if (placeholder) {
                this._shadow.querySelector("input").setAttribute("placeholder", placeholder);
            }
        }

        get value() {
            return this._shadow.querySelector("input").value;
        }
        set value(newValue) {
            this._shadow.querySelector("input").value = newValue;
        }

    };
    customElements.define('fhir-search-text', FhirSearchText)
})();
