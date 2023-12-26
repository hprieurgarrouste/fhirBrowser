import template from "./templates/ResourceXmlView.html";

import "./components/AppSwitch"

import { FhirService } from "./services/Fhir"
import { PreferencesService } from "./services/Preferences"

class ResourceXmlView extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;

        this._resource = null;

        this._content = this._shadow.getElementById("content");
        this._content.onclick = this.contentClick;

        this._preferences = PreferencesService.get('xmlView', { 'sorted': false });

        this._sort = this._preferences.sorted;
        this._sortToggle = this._shadow.querySelector('app-switch');
        if (this._sort) {
            this._sortToggle.setAttribute('data-checked', '');
        } else {
            this._sortToggle.removeAttribute('data-checked');
        }
        this._sortToggle.parentNode.onclick = this.sortToggleClick;
    }

    sortToggleClick = ({ target }) => {
        const ATBNAME = 'data-checked';
        if ("APP-SWITCH" !== target.nodeName) {
            this._sortToggle.hasAttribute(ATBNAME) ? this._sortToggle.removeAttribute(ATBNAME) : this._sortToggle.setAttribute(ATBNAME, '');
        }
        this._sort = this._sortToggle.hasAttribute(ATBNAME);
        PreferencesService.set('xmlView', { 'sorted': this._sort });
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
        this._resource = null;
    }

    get resourceType() {
        return this._resource?.documentElement?.nodeName;
    }
    get resourceId() {
        return this._resource?.documentElement?.querySelector('id[value]')?.getAttribute('value');
    }
    get source() {
        return this._resource;
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
        if (this._sort) entries.sort((n1, n2) => {
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
                        let url = a.nodeValue.replace(`${FhirService.server.url}`, '')
                        if (!url.startsWith('/') && !url.startsWith('?')) url = `/${url}`;
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
