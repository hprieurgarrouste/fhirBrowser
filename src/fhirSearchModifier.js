customElements.define('fhir-search-modifier', class FhirSearchModifier extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.appendChild(FhirSearchModifierTemplate.content.cloneNode(true));
    }

    connectedCallback() {

    }

    get value() {
        return this._shadow.querySelector("input").value;
    }
    set value(newValue) {
        this._shadow.querySelector("input").value = newValue;
    }

});

const FhirSearchModifierTemplate = document.createElement('template');
FhirSearchModifierTemplate.innerHTML = `
    <style>
        main {
            background-color: var(--hover-color);
            border-bottom: 1px solid gray;
        }
        main:focus-within {
            border-color: var(--primary-color);
        }
        input {
            background: none;
            border: 0 none;
            border-bottom: 1px solid transparent;
            color: var(--text-color-normal);
            flex: auto;
            font: inherit;
            padding: 5px;
            width: 90px;
        }
        input:focus {
            outline: none;
            border-color: var(--primary-color);
        }
    </style>
    <main>
        <input placeholder="Modifier" list="FhirSearchFieldModifierList"></input>
        <datalist id="FhirSearchFieldModifierList">
            <option value="contains"></option>
            <option value="exact"></option>
        </datalist>
    </main>
`;
