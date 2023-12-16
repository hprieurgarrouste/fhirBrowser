import template from "./templates/ResourceXmlView.html";

import "./components/AppSwitch"

import { FhirService } from "./services/Fhir"
import { PreferencesService } from "./services/Preferences"

class ResourceXmlView extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._sorted = false;
        this._resource = null;
    }

    connectedCallback() {
        this._shadow.getElementById("content").onclick = this.contentClick;
        this._sorted = PreferencesService.get('xmlView', { 'sorted': true }).sorted;
        const sortedSwitch = this._shadow.querySelector('app-switch');
        this._shadow.querySelector('app-switch').onclick = this.sortedClickHandler;
        if (this._sorted) {
            sortedSwitch.setAttribute('data-checked', '');
        } else {
            sortedSwitch.removeAttribute('data-checked');
        }
    }

    sortedClickHandler = (event) => {
        this._sorted = this._shadow.querySelector('app-switch').hasAttribute('data-checked');
        PreferencesService.set('xmlView', { 'sorted': this._sorted });
        this.source = this._resource;
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

    clear = () => {
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
        content.innerHTML = this.parse(resource).outerHTML;
        content.style.cursor = "default";
        this._resource = resource;
    }

    parse = (obj) => {
        let dl = document.createElement('dl');
        let entries = Array.from(obj.children);
        if (this._sorted) entries.sort((n1, n2) => {
            return n1.nodeName.localeCompare(n2.nodeName);
        });
        entries.forEach(e => {
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
                valueElm.innerHTML = this.parse(e).outerHTML;
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

};
customElements.define('resource-xml-view', ResourceXmlView);
