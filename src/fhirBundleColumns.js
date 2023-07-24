import "./components/RoundButton.js"
import "./components/ListItem.js"
import "./components/ListRowCheck.js"
import { FhirService } from "./services/Fhir.js";

(function () {
    class FhirBundleColumns extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
            this._resourceType = null;
        }

        clear() {
            const content = this._shadow.getElementById("content");
            content.scrollTop = 0;
            while (content.firstChild) content.removeChild(content.lastChild);
        }

        load(resourceType) {
            if (resourceType === this._resourceType) return;
            this.clear();
            FhirService.structureDefinition(resourceType).then(structureDefinition => {
                const nav = this._shadow.getElementById('content');
                structureDefinition.snapshot.element
                    .filter(e => e.isSummary)
                    .sort((e1, e2) => e1.path.localeCompare(e2.path))
                    .forEach(element => {
                        const path = element.path;
                        const item = document.createElement('list-item');
                        item.setAttribute("data-primary", path.substr(path.indexOf(".") + 1));
                        item.setAttribute("data-secondary", element.short);
                        const row = document.createElement('list-row-check');
                        row.setAttribute("data-id", element.id);
                        row.appendChild(item);
                        nav.appendChild(row);
                    });
            }).catch((e) => {
                //todo
            });
        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link rel="stylesheet" href="./assets/material.css">
        <style>
            main {
                display:flex;
                flex-direction: column;
                height: 100%;
            }
            #content {
                overflow: auto;
                flex: 1 1 auto;
                height: 0;
            }
            #content > * {
                cursor: pointer;
            }
            #actions {
                border-top: 1px solid var(--border-color);
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
        </style>
        <main>
            <section id="content"></section>
            <section id="actions">
                <input type="button" value="Apply"></input>
            <section>
        </main>
    `;

    window.customElements.define('fhir-bundle-columns', FhirBundleColumns);
})();