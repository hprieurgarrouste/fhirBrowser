import "./appRoundButton.js"
import "./appListItem.js"
import "./fhirSearchItem.js"

customElements.define('fhir-search', class FhirSearch extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(FhirSearchTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        const content = this._shadow.getElementById("content");
        this._shadow.querySelector("main").addEventListener("click", () => {
            this.hidden = true;
        });

        this._shadow.getElementById('close').addEventListener("click", () => {
            this.hidden = true;
        });

        this._shadow.querySelector(".surface").addEventListener("click", (event) => {
            event.stopPropagation();
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
            this.hidden = true;
        });
    }

    /**
     * @param {any} metadata
     */
    set metadata(metadata) {
        const content = this._shadow.getElementById("content");
        content.scrollTop = 0;
        while (content.firstChild) content.removeChild(content.lastChild);

        const sorted = metadata.searchParam.sort((s1, s2) => s1.name < s2.name ? -1 : s1.name > s2.name ? 1 : 0);
        sorted.forEach(search => {
            const item = document.createElement("fhir-search-item");
            if (item.init(search)) {
                content.appendChild(item);
            }
        });
    }

});

const FhirSearchTemplate = document.createElement('template');
FhirSearchTemplate.innerHTML = `
    <link rel="stylesheet" href="./material.css">
    <style>
        main {
            position: absolute;
            top: 0;
            left:0;
            background-color: rgba(0,0,0,32%);
            min-height: 100%;
            min-width: 100%;
        }
        .surface {
            background-color: var(--background-color, white);
            border-radius: 4px;
            height: 100%;
            width: 50%;
            position: absolute;
            top: 0;
            right: 0;
        }
        .overlay {
            background-color: rgba(255,255,255,4%);
            color:var(--text-color-normal, white);
            display:flex;
            flex-direction: column;
            font-family: Roboto, Arial, monospace;
            height: 100%;
        }
        #content {
            border-bottom: 1px solid var(--border-color);
            border-top: 1px solid var(--border-color);
            overflow: auto;
            flex: 1 1 auto;
            height: 0;
            padding: 1em;
        }
        #actions {
            padding: 0.5em 1em;
            text-align: center;
            overflow: hidden;
        }
        #actions input[type=button] {
            background: none;
            border: 1px solid var(--primary-color);
            border-radius: 4px;
            color: var(--primary-color);
            cursor: pointer;
            font: inherit;
            padding: 5px 16px;
            text-transform: uppercase;
        }
        #actions input[type=button]:hover {
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
        }
    </style>
    <main>
        <div class="surface">
            <div class="overlay">
                <app-bar id="header">
                    <app-round-button id="close" title="Close" app-icon="close" slot="left"></app-round-button>
                    <h3 id="title" slot="middle">Search</h3>
                    <app-round-button id="clear" title="Clear" app-icon="clear_all" slot="right"></app-round-button>
                    <app-round-button id="help" title="Help" app-icon="help" slot="right"></app-round-button>
                </app-bar>
                <div id="content"></div>
                <div id="actions">
                    <input type="button" id="apply" value="Apply"></input>
                <div>
            </div>
        </div>
    </main>
`;
