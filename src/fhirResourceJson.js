import template from "./templates/fhirResourceJson.html";

import { FhirService } from "./services/Fhir.js";

class FhirResourceJson extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }
    connectedCallback() {
        this._shadow.getElementById("content").addEventListener('click', ({ target, offsetX, offsetY, ctrlKey }) => {
            if (target.classList.contains("array") || target.classList.contains("object")) {
                const key = target.childNodes[0];
                if (key && offsetX < key.offsetLeft && offsetY < key.offsetHeight) {
                    target.classList.toggle("collapsed");
                    if (ctrlKey) {
                        const collapsed = target.classList.contains("collapsed");
                        Array.from(target.querySelectorAll('dt'))
                            .filter(e => e.classList.contains('object') || e.classList.contains('array'))
                            .forEach(e => {
                                if (collapsed) {
                                    e.classList.add("collapsed");
                                } else {
                                    e.classList.remove("collapsed");
                                }
                            });
                    }

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
            for (const [key, value] of Object.entries(obj).sort((o1, o2) => { return o1[0].localeCompare(o2[0]) })) {
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
customElements.define('fhir-resource-json', FhirResourceJson);
