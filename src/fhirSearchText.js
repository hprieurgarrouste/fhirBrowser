customElements.define('fhir-search-text', class FhirSearchText extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.appendChild(FhirSearchTextTemplate.content.cloneNode(true));
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

});

const FhirSearchTextTemplate = document.createElement('template');
FhirSearchTextTemplate.innerHTML = `
    <style>
        main {
            background-color: var(--hover-color);
            border-bottom: 1px solid gray;
            display: flex;
            flex
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
        }
        input:focus {
            outline: none;
            border-color: var(--primary-color);
        }
    </style>
    <main>
        <input type="text"></input>
    </main>
`;
