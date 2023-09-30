import template from "./templates/fhirSearchItem.html";

import "./fhirSearchModifier.js"
import "./fhirSearchPrefix.js"
import "./fhirSearchText.js"
import "./fhirSearchDate.js"

(function () {
    class FhirSearchItem extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' })
            this._shadow.innerHTML = template;
        }

        clear() {
            const fields = this._shadow.querySelectorAll("fhir-search-text, fhir-search-date, fhir-search-modifier, fhir-search-prefix");
            fields.forEach(field => field.value = "");
        }

        get value() {
            let field;
            switch (this._search.type) {
                case "token":
                    let value = '';
                    const system = this._shadow.querySelector('fhir-search-text[data-type="system"]');
                    if (system?.value) value = `${system.value}|`;
                    field = this._shadow.querySelector('fhir-search-text:not([data-type])');
                    if (field?.value) value += field.value;
                    if (!value) return null;
                    return {
                        "name": this._search.name,
                        "value": value
                    };
                case "string":
                case "reference":
                    field = this._shadow.querySelector('fhir-search-text');
                    if (field?.value) {
                        let name = this._search.name;
                        const modifier = this._shadow.querySelector('fhir-search-modifier');
                        if (modifier?.value) name += `:${modifier.value}`;
                        return {
                            "name": name,
                            "value": field.value
                        };
                    }
                    break;
                case "date":
                case "datetime":
                    field = this._shadow.querySelector('fhir-search-date');
                    if (field?.value) {
                        let value = field.value;
                        const prefix = this._shadow.querySelector('fhir-search-prefix');
                        if (prefix?.value) value = prefix.value + value;
                        return {
                            "name": this._search.name,
                            "value": value
                        };
                    }
                    break;
                default:
                    break;
            }
            return null;
        }

        init(search) {
            function addModifier(search) {
                let field = document.createElement("fhir-search-modifier");
                field.setAttribute("data-name", search.name);
                content.appendChild(field);
            }
            function addSystem(search) {
                let field = document.createElement("fhir-search-text");
                field.setAttribute("placeholder", 'System');
                field.setAttribute("data-type", 'system');
                field.setAttribute("name", search.name);
                content.appendChild(field);
            }
            function addText(search, placeholder) {
                let field = document.createElement("fhir-search-text");
                field.setAttribute("name", search.name);
                if (placeholder) field.setAttribute("placeholder", placeholder);
                content.appendChild(field);
            }
            //remove format selector, only json supported
            if ("_format" === search.name) return false;

            this._search = search;
            this._shadow.querySelector("legend").innerText = search.name;
            this._shadow.querySelector("span").innerText = search.documentation || '';
            const content = this._shadow.querySelector("fieldset");

            let field;
            if ('_id' == search.name) {
                addText(search);
            } else if ('_filter' == search.name) {
                addText(search);
            } else {
                switch (search.type) {
                    case "token":
                        addSystem(search);
                        addText(search, 'code');
                        break;
                    case "string":
                    case "reference":
                        addModifier(search);
                        addText(search);
                        break;
                    case "date":
                    case "datetime":
                        field = document.createElement("fhir-search-prefix");
                        field.setAttribute("data-name", search.name);
                        content.appendChild(field);

                        field = document.createElement("fhir-search-date");
                        field.setAttribute("name", search.name);
                        content.appendChild(field);
                        break;
                    default:
                        return false;
                }
            }
            return true;
        }
    };
    customElements.define('fhir-search-item', FhirSearchItem)
})();
