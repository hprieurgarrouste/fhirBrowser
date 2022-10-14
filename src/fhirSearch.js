import "./appRoundButton.js"
import "./appListItem.js"
import { Preferences } from "./appPreferences.js";

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
            const fields = content.querySelectorAll("input");
            fields.forEach(field => {
                field.value = ""
            });
        });
        this._shadow.getElementById('help').addEventListener('click', () => {
            window.open("https://hl7.org/fhir/search.html", "FhirBrowserHelp");
        });
        this._shadow.getElementById("apply").addEventListener("click", () => {
            const fields = content.querySelectorAll("input");
            let parameters = {};
            fields.forEach(field => {
                if (field.value) {
                    parameters[field.name] = { "value": field.value, "modifier": "" };
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
            let fields = null;
            let inputs = null;
            switch (search.type) {
                case "string":
                case "code":
                case "markdown":
                case "id":
                case "reference":
                    fields = FhirSearchFieldTextTemplate.content.cloneNode(true);
                    inputs = fields.querySelectorAll("input");
                    inputs.forEach(field => {
                        field.name = search.name + field.name;
                    })
                    break;
                case "date":
                    fields = FhirSearchFieldDateTemplate.content.cloneNode(true);
                    inputs = fields.querySelectorAll("input");
                    inputs.forEach(field => {
                        field.name = search.name + field.name;
                    })
                default:
                    break;
            }

            if (fields) {
                const item = FhirSearchFieldTemplate.content.cloneNode(true);
                item.querySelector(".helper").innerText = search.documentation;
                item.querySelector("legend").innerText = search.name;
                item.querySelector("fieldset").appendChild(fields);
                content.appendChild(item);
            }
        });
    }

});

const FhirSearchFieldTemplate = document.createElement('template');
FhirSearchFieldTemplate.innerHTML = `
    <div class="item">
        <fieldset>
            <legend></legend>
        </fieldset>
        <span class="helper"></span>
    </div>
`;

const FhirSearchFieldTextTemplate = document.createElement('template');
FhirSearchFieldTextTemplate.innerHTML = `
    <div style="flex:none"><div class="field">
        <input name="" placeholder="Modifier" list="FhirSearchFieldTextList"></input>
        <datalist id="FhirSearchFieldTextList">
            <option value="exact"></option>
            <option value="contains"></option>
        </datalist>
    </div></div>
    <div class="field">
        <input name="" type="text">
    </div>
`;

const FhirSearchFieldDateTemplate = document.createElement('template');
FhirSearchFieldDateTemplate.innerHTML = `
    <div style="flex:none"><div class="field">
        <input class="modifier" name="_prefix" placeholder="Prefix" list="FhirSearchFieldDateList"></input>
        <datalist id="FhirSearchFieldDateList">
            <option value="eq">Is equal to</option>
            <option value="ne">is not equal to</option>
            <option value="gt">is greater than</option>
            <option value="lt">is less than</option>
            <option value="ge">is greater or equal to</option>
            <option value="le">is less or equal to</option>
        </datalist>
    </div></div>
    <div class="field">
        <input name="_date" type="date"></input>
        <input name="_time" type="time"></input>
    </div>
`;

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

        .item {
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
        fieldset:focus-within div.field,
        fieldset:focus-within div.field input {
            border-color: var(--primary-color);
        }

        .helper {
            color: var(--text-color-disabled);
            font-size: small;
        }
        div.field {
            background-color: var(--hover-color);
            border-bottom: 1px solid gray;
            flex: auto;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
        }
        div.field input {
            background: none;
            border: 0 none;
            border-bottom: 1px solid transparent;
            color: var(--text-color-normal);
            flex: auto;
            font: inherit;
            padding: 0.5em;
            width: 90px;
        }
        div.field input[type=date],
        div.field input[type=time] {
            max-width: 120px;
            min-width: 100px;
        }
        div.field input:focus {
            outline: none;
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
