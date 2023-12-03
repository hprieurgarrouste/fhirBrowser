import template from "./templates/fhirResourceXml.html";

import { FhirService } from "./services/Fhir.js";

class FhirResourceXml extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }
    connectedCallback() {
        this._shadow.getElementById("content").onclick = this.contentClick;
    }

    contentClick = ({ target, offsetX, offsetY, ctrlKey }) => {
        if (target.classList.contains("object")) {
            const key = target.childNodes[0];
            if (key && offsetX < key.offsetLeft && offsetY < key.offsetHeight) {
                target.classList.toggle("collapsed");
                if (ctrlKey) {
                    const collapsed = target.classList.contains("collapsed");
                    Array.from(target.querySelectorAll('dt'))
                        .filter(e => e.classList.contains('object'))
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
    };

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
        content.style.cursor = "default";

        content.innerHTML = parse(resource).outerHTML;

        function parse(obj) {
            let dl = document.createElement('dl');
            Array.from(obj.children).sort((n1, n2) => {
                return n1.nodeName.localeCompare(n2.nodeName);
            }).forEach(e => {
                const dt = document.createElement('dt');

                let keyElm = document.createElement('span');
                keyElm.className = "key";
                keyElm.innerText = e.nodeName;
                dt.appendChild(keyElm);

                if (e.attributes.length) {
                    Array.from(e.attributes).forEach(a => {
                        let atb = document.createElement('span');
                        atb.className = "attributes";
                        atb.innerText = ` ${a.nodeName}=`;
                        keyElm.appendChild(atb);
                        let val = document.createElement('span');
                        val.className = "values";
                        if ("reference" === e.nodeName && "value" === a.nodeName) {
                            let url = a.nodeValue;
                            if (url.startsWith(FhirService.server.url)) {
                                url = url.slice(FhirService.server.url.length + 1);
                            }
                            let link = document.createElement('a');
                            link.setAttribute("href", `#${url}`);
                            link.appendChild(document.createTextNode(`"${a.nodeValue}"`));
                            val.appendChild(link);
                        } else {
                            val.innerText = `"${a.nodeValue}"`;
                        }
                        atb.appendChild(val);
                    });
                }

                const valueElm = document.createElement('span');
                valueElm.classList.add("value");
                if (e.children.length) {
                    dt.classList.add("object");
                    valueElm.innerHTML = parse(e).outerHTML;
                    dt.appendChild(valueElm);

                    keyElm = document.createElement('span');
                    keyElm.className = "key end";
                    keyElm.innerText = `/${e.nodeName}`;
                    dt.appendChild(keyElm);
                } else {
                    keyElm.innerHTML += '/';
                }

                dl.appendChild(dt);
            });
            return dl;
        }
    }
};
customElements.define('fhir-resource-xml', FhirResourceXml);
