customElements.define('fhir-search-prefix', class FhirSearchPrefix extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.appendChild(FhirSearchPrefixTemplate.content.cloneNode(true));
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

const FhirSearchPrefixTemplate = document.createElement('template');
FhirSearchPrefixTemplate.innerHTML = `
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
        <input placeholder="Prefix" list="FhirSearchPrefixList"></input>
        <datalist id="FhirSearchPrefixList">
            <option value="eq">Is equal to</option>
            <option value="ne">is not equal to</option>
            <option value="gt">is greater than</option>
            <option value="lt">is less than</option>
            <option value="ge">is greater or equal to</option>
            <option value="le">is less or equal to</option>
        </datalist>
    </div>
`;