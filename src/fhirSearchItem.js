import "./fhirSearchModifier.js"
import "./fhirSearchPrefix.js"
import "./fhirSearchText.js"
import "./fhirSearchDate.js"


customElements.define('fhir-search-item', class FhirSearchItem extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.appendChild(FhirSearchItemTemplate.content.cloneNode(true));
    }

    connectedCallback() {

    }

    clear() {
        const fields = this._shadow.querySelectorAll("fhir-search-text, fhir-search-date, fhir-search-modifier, fhir-search-prefix");
        fields.forEach(field => field.value = "");
    }

    get value() {
        let field;
        switch (this._search.type) {
            case "string":
            case "code":
            case "markdown":
            case "id":
            case "reference":
                field = this._shadow.querySelector('fhir-search-text');
                if (field && field.value) {
                    let name = this._search.name;
                    const modifier = this._shadow.querySelector('fhir-search-modifier');
                    if (modifier && modifier.value) name += `:${modifier.value}`;
                    return {
                        "name": name,
                        "value": field.value
                    };
                }
                break;
            case "date":
                field = this._shadow.querySelector('fhir-search-date');
                if (field && field.value) {
                    let value = field.value;
                    const prefix = this._shadow.querySelector('fhir-search-prefix');
                    if (prefix && prefix.value) value = prefix.value + value;
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
        this._search = search;
        this._shadow.querySelector("legend").innerText = search.name;
        this._shadow.querySelector("span").innerText = search.documentation || '';
        const content = this._shadow.querySelector("fieldset");

        let field;
        switch (search.type) {
            case "string":
            case "code":
            case "markdown":
            case "id":
            case "reference":
                field = document.createElement("fhir-search-modifier");
                field.setAttribute("data-name", search.name);
                content.appendChild(field);

                field = document.createElement("fhir-search-text");
                field.setAttribute("name", search.name);
                content.appendChild(field);
                break;
            case "date":
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
        return true;
    }
});

const FhirSearchItemTemplate = document.createElement('template');
FhirSearchItemTemplate.innerHTML = `
    <style>
        main {
            margin-bottom: 1em;
        }
        fieldset {
            display: flex;
            flex-direction: row;
            border: none;
            padding: 0;
            gap: 1em;
        }
        fieldset:focus-within legend {
            font-weight: bold;
            color: var(--primary-color);
        }
        fhir-search-text,
        fhir-search-date {
            flex:auto;
        }
        span {
            color: var(--text-color-disabled);
            font-size: small;
        }
    </style>
    <main>
        <fieldset>
            <legend></legend>
            <slot></slot>
        </fieldset>
        <span></span>
    </main>
`;