import "./components/RoundButton.js"
import "./fhirSearchItem.js"

customElements.define('fhir-search', class FhirSearch extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(FhirSearchTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        const content = this._shadow.querySelector("main");

        this._shadow.getElementById("back").addEventListener('click', () => {
            this.classList.add("hidden");
        });

        this._shadow.getElementById("clear").addEventListener("click", () => {
            const fields = content.querySelectorAll("fhir-search-item");
            fields.forEach(field => field.clear());
        });

        this._shadow.getElementById('help').addEventListener('click', () => {
            window.open("https://hl7.org/fhir/search.html", "FhirBrowserHelp");
        });

        this._shadow.getElementById("apply").addEventListener("click", () => {
            const parameters = [];
            const fields = content.querySelectorAll("fhir-search-item");
            fields.forEach(field => {
                let value = field.value;
                if (value) {
                    parameters.push(value);
                }
            });
            this.dispatchEvent(new CustomEvent("apply", {
                bubbles: false,
                cancelable: false,
                "detail": {
                    "parameters": parameters
                }
            }));
        });
    }

    /**
     * @param {any} metadata
     */
    set metadata(metadata) {
        const content = this._shadow.querySelector("main");
        content.scrollTop = 0;
        while (content.firstChild) content.removeChild(content.lastChild);
        if (metadata.searchParam) {
            const sorted = metadata.searchParam.sort((s1, s2) => s1.name < s2.name ? -1 : s1.name > s2.name ? 1 : 0);
            sorted.forEach(search => {
                const item = document.createElement("fhir-search-item");
                if (item.init(search)) {
                    content.appendChild(item);
                }
            });
        }
    }

});

const FhirSearchTemplate = document.createElement('template');
FhirSearchTemplate.innerHTML = `
    <link rel="stylesheet" href="./assets/material.css">
    <style>
        #wrapper {
            background-color: rgba(255,255,255,4%);
            color:var(--text-color-normal, white);
            display:flex;
            flex-direction: column;
            font-family: Roboto, Arial, monospace;
            height: 100%;
        }
        header {
            padding-bottom: 3px;
        }
        header h3 {
            margin:0;
        }
        #back {
            display: none;
        }
        main {
            box-shadow: inset 0px 2px 4px 0px var(--border-color);
            border-bottom: 1px solid var(--border-color);
            border-top: 1px solid var(--border-color);
            overflow: auto;
            flex: 1 1 auto;
            height: 0;
            padding: 1em;
        }
        footer {
            padding: 9px 16px;
            text-align: center;
            overflow: hidden;
        }
        footer input[type=button] {
            background: none;
            border: 1px solid var(--primary-color);
            border-radius: 4px;
            color: var(--primary-color);
            cursor: pointer;
            font: inherit;
            padding: 5px 16px;
            text-transform: uppercase;
        }
        footer input[type=button]:hover {
            background-color: var(--hover-color);
        }
        @media (max-width:480px){
            .surface {
                left:0;
                right: unset;
                width:100%;
                max-width: unset;
                max-height: unset;
            }
            .overlay {
                background-color: transparent;
            }
            #back {
                display: unset;
            }
        }
    </style>
    <div id="wrapper">
        <header>
            <app-bar id="header">
                <round-button slot="left" id="back" title="back" app-icon="arrow_back"></round-button>
                <h3 id="title" slot="middle">Search</h3>
                <round-button id="clear" title="Clear" app-icon="clear_all" slot="right"></round-button>
                <round-button id="help" title="Help" app-icon="help" slot="right"></round-button>
            </app-bar>
        </header>
        <main></main>
        <footer>
            <input type="button" id="apply" value="Apply"></input>
        </footer>
    </main>
`;
