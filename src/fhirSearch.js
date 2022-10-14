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

        while (content.firstChild) content.removeChild(content.lastChild);

        /**
         *  <div class="item">
         *    <div class="field">
         *       <label for=""></label>
         *       <input type=""></input>
         *    </div>
         *    <span></span>
         *  </div>
         **/
        const sorted = metadata.searchParam.sort((s1, s2) => s1.name < s2.name ? -1 : s1.name > s2.name ? 1 : 0);
        sorted.forEach(search => {
            if ("string" === search.type) {
                const itm = document.createElement('div');
                itm.className = "item";
                content.appendChild(itm);

                const field = document.createElement('div');
                field.className = "field";
                itm.appendChild(field);

                const lbl = document.createElement('label');
                lbl.setAttribute("for", search.name);
                lbl.innerText = search.name;
                content.appendChild(lbl);
                field.appendChild(lbl);

                const txt = document.createElement('input');
                txt.setAttribute("name", search.name);
                txt.setAttribute("type", "text");
                field.appendChild(txt);


                const hlp = document.createElement('span');
                hlp.innerText = search.documentation;
                content.appendChild(hlp);
                itm.appendChild(hlp);
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
            height: 50%;
            width: 50%;
            position: absolute;
            top: 60px;
            right: 1em;
        }
        .overlay {
            background-color: rgba(255,255,255,4%);
            color:var(--text-color-normal, white);
            display:flex;
            flex-direction: column;
            font-family: Roboto, Arial, monospace;
            height: 100%;
        }
        app-bar {
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
        div.item {
            display:flex;
            flex-direction: column;
            margin-bottom: 0.5em;
        }
        div.item span {
            color: var(-text-color-disabled);
            font-size: small;
            padding-left: 1em;
        }
        div.item:focus-within {
            border-color: var(--primary-color);
        }
        div.item:focus-within label {
            color: var(--primary-color);
        }
        div.item:focus-within input {
            border-color: var(--primary-color);
        }
        div.field {
            background-color: var(--hover-color);
            border-bottom: 1px solid gray;
            display: flex;
            position: relative;
        }
        div.field label {
            left: 1em;
            position: absolute;
            top: 0.2em;
            font-size: smaller;
        }
        div.field input {
            padding: 25px 1em 5px 1em;
            flex: auto;
            border: 0 none;
            background: none;
            font: inherit;
            border-bottom: 1px solid transparent;
            color: var(--text-color-normal);
        }
        div.field input:focus {
            outline: none;
        }
        @media (max-width:480px){
            .surface {
                top:0;
                left:0;
                height: 100%;
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
                </app-bar>
                <div id="content"></div>
                <div id="actions">
                    <input type="button" id="apply" value="Apply"></input>
                <div>
            </div>
        </div>
    </main>
`;
