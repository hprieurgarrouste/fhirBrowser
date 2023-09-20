import { FhirService } from "./services/Fhir.js";

(function () {
    class FhirResourceJson extends HTMLElement {
        constructor() {
            super();
            this._shadow = this.attachShadow({ mode: 'closed' });
            this._shadow.appendChild(template.content.cloneNode(true));
        }
        connectedCallback() {
            this._shadow.getElementById("content").addEventListener('click', ({ target, offsetX, offsetY }) => {
                if (target.classList.contains("array") || target.classList.contains("object")) {
                    const key = target.childNodes[0];
                    if (key && offsetX < key.offsetLeft && offsetY < key.offsetHeight) {
                        target.classList.toggle("collapsed");
                    }
                }
            });
        }

        clear() {
            const content = this._shadow.getElementById("content");
            content.scrollTo(0, 0);
            content.innerHTML = "Loading...";
            content.style.cursor = "wait";
        }

        /**
         * @param {object} resource
         */
        set source(resource) {
            const content = this._shadow.getElementById("content");
            content.scrollTo(0, 0);
            content.innerHTML = "";
            content.appendChild(document.createTextNode("{"));
            content.appendChild(parse(resource));
            content.appendChild(document.createTextNode("}"));
            content.style.cursor = "default";

            function isUrl(value) {
                let url;
                try {
                    url = new URL(value);
                } catch (_) {
                    return false;
                }
                return url.protocol === "http:" || url.protocol === "https:";
            }
            function parse(obj) {
                let dl = document.createElement('dl');
                for (const [key, value] of Object.entries(obj)) {
                    const dt = document.createElement('dt');

                    const keyElm = document.createElement('span');
                    keyElm.className = "key";
                    keyElm.innerText = key;
                    dt.appendChild(keyElm);

                    const valueElm = document.createElement('span');
                    valueElm.classList.add("value");
                    if (value === null) {
                        valueElm.innerText = "null";
                    } else if ("string" === typeof (value)) {
                        valueElm.classList.add("string");
                        if (key === "reference") {
                            let url = value;
                            if (url.startsWith(FhirService.server.url)) {
                                url = url.slice(FhirService.server.url.length + 1);
                            }
                            let a = document.createElement('a');
                            a.setAttribute("href", `#${url}`);
                            a.appendChild(document.createTextNode(value));
                            valueElm.appendChild(a);
                        } else if (isUrl(value)) {
                            let a = document.createElement('a');
                            a.setAttribute("href", value);
                            a.setAttribute("target", "_blank");
                            a.appendChild(document.createTextNode(value));
                            valueElm.appendChild(a);
                        } else {
                            valueElm.innerText = value;
                        }
                    } else if ("object" === typeof (value)) {
                        dt.classList.add(Array.isArray(value) ? "array" : "object");
                        valueElm.appendChild(parse(value));
                    } else {
                        valueElm.innerText = value;
                    }
                    dt.appendChild(valueElm);

                    dl.appendChild(dt);
                }
                return dl;
            }
        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link rel="stylesheet" href="./assets/material.css">
        <style>
            main {
                --indent: 32px;
                display:flex;
                flex-direction:column;
                height:100%;
            }
            #content {
                box-shadow: inset 0px 2px 4px 0px var(--border-color);
                color: var(--text-color-normal, black);
                flex: 1 1 auto;
                font-family: monospace;
                height:0;
                overflow: auto;
                padding: 1em;
                white-space: nowrap;
            }
            dl {
                margin: 0;
                padding-left: var(--indent);
            }
            dt {
                list-style-type: none;
            }
            span {
                color: var(--json-viewer-values-color, black);
                cursor: inherit;
            }
            span.key {
                color: var(--json-viewer-properties-color, black);
            }
            span.key::before {
                content: '"';
            }
            span.key::after {
                content: '": ';
            }
            dt.array > span.value > dl > dt > span.key::before {
                content: '';
            }
            dt.array > span.value > dl > dt > span.key::after {
                content: ': ';
            }
            span.value.string::before {
                content: '"';
            }
            span.value.string::after {
                content: '"';
            }
            dt.array > span.value::before {
                content: '[';
            }
            dt.array > span.value::after {
                content: ']';
            }
            dt.object > span.value::before {
                content: '{';
            }
            dt.object > span.value::after {
                content: '}';
            }
            dt,
            dt.array > span.value::after,
            dt.object > span.value::after {
                padding-left: var(--indent);
            }
            dt.array,
            dt.object {
                padding-left: 0;
            }
            dt.array::before,
            dt.object::before {
                cursor: pointer;
                content: 'expand_less ';
                font-family: 'Material Symbols Sharp';
                font-weight: bold;
                line-height: inherit;
                vertical-align: middle;
                color: var(--text-color-disabled, black);
            }
            dt:not(:last-child)::after {
                content: ",";
            }
            dt.collapsed::before {
                content: 'expand_more ';
            }
            dt.collapsed > span dl {
                display: none;
            }
            dt.array.collapsed span.value::after {
                content: '...]';
                padding-left: 0;
            }
            dt.object.collapsed span.value::after {
                content: '...}';
                padding-left: 0;
            }
            @media (max-width:480px){
                #content {
                    line-height: 2em;
                }
            }
        </style>
        <main>
            <div id="content"></div>
        </main>
    `;

    window.customElements.define('fhir-resource-json', FhirResourceJson);
})();
