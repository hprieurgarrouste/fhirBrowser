customElements.define('fhir-search-date', class FhirSearchDate extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' })
        this._shadow.appendChild(FhirSearchDateTemplate.content.cloneNode(true));
    }

    connectedCallback() {

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

});

const FhirSearchDateTemplate = document.createElement('template');
FhirSearchDateTemplate.innerHTML = `
    <style>
        main {
            background-color: var(--hover-color);
            border-bottom: 1px solid gray;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
        }
        main:focus-within,
        main:focus-within input {
            border-color: var(--primary-color);
        }
        input {
            background: none;
            border: 0 none;
            border-bottom: 1px solid transparent;
            color: var(--text-color-normal);
            flex: auto;
            font: inherit;
            padding: 4px 5px;

            max-width: 120px;
            min-width: 100px;
        }
        input:focus {
            outline: none;
        }
    </style>
    <main>
        <input type="date"></input>
        <input type="time"></input>
    </main>
`;
