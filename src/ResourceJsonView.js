import template from "./templates/ResourceJsonView.html";

import "./components/AppSwitch"
import "./ResourceTemplateView"
import "./ResourceTemplateEditor"
import "./ResourceTemplateEditorDialog"

import { FhirService } from "./services/Fhir"
import { PreferencesService } from "./services/Preferences"

class ResourceJsonView extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._sort = false;
        this._resource = null;
        this._content = null;
        this._sortToggle = null;
        this._templateToggle = null;
        this._templateView = null;
        this._preferences = {};
        this._templateEditButton = null;
    }

    connectedCallback() {
        this._content = this._shadow.getElementById("content");
        this._content.onclick = this.contentClick;

        this._preferences = PreferencesService.get('jsonView', { 'sorted': false, 'template': false });

        this._sort = this._preferences.sorted;
        this._sortToggle = this._shadow.getElementById('sort-toggle');
        this._sortToggle.parentNode.onclick = this.sortToggleClick;
        if (this._sort) {
            this._sortToggle.setAttribute('data-checked', '');
        } else {
            this._sortToggle.removeAttribute('data-checked');
        }

        this._search = this._shadow.getElementById('search');
        this._search.addEventListener("keydown", this.searchKeyDown);
        this._search.hidden = true;                                                //WIP not available yet

        this._templateToggle = this._shadow.getElementById('use-template-toggle');
        this._templateView = this._shadow.querySelector('resource-template-view');
        this._templateEditButton = this._shadow.getElementById('template-edit-button');

        this._templateToggle.parentNode.hidden = true;                             //WIP not available yet
        this._template = false;                                                    //WIP not available yet
        this._templateView.hidden = true;                                          //WIP not available yet
        this._templateEditButton.hidden = true;                                    //WIP not available yet
        /*this._templateToggle.parentNode.onclick = this.templateToggleClick;
        this._templateEditButton.onclick = this.showTemplateEditor;
        this._template = this._preferences.template;
        if (this._template) {
            this._templateToggle.setAttribute('data-checked', '');
            this.showTemplate(true);
        } else {
            this._templateToggle.removeAttribute('data-checked');
            this.showTemplate(false);
        }

        this._editor = document.createElement('resource-template-editor-dialog');
        this._editor.hidden = true;
        document.querySelector('fhir-browser').container.appendChild(this._editor);
        */
    }

    searchKeyDown = (event) => {
        if ('Enter' === event.code || 'NumpadEnter' === event.code) {
            this.search();
        }
    }

    search = () => {
        const search = this._search.value.trim().toLowerCase();
        if (!search) return;

        const allNodes = document.evaluate(`.//span[contains(text(), '${search}')]/text()`, this._content, null, XPathResult.ANY_TYPE, null);
        const node = allNodes.iterateNext();
        const startPos = node.textContent.indexOf(search);
        const range = new Range();
        range.setStart(node, startPos);
        range.setEnd(node, startPos + search.length);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
        node.parentNode.scrollIntoView();
    }

    showTemplateEditor = () => {
        this._editor.source = this._resource;
        this._editor.hidden = false;
    }

    showTemplate = (bool) => {
        this._templateView.hidden = !bool;
        this._templateEditButton.hidden = !bool;
        this._content.hidden = bool;
        this._search.hidden = bool;
        this._sortToggle.parentNode.hidden = bool;
    }

    sortToggleClick = ({ target }) => {
        const ATBNAME = 'data-checked';
        if ("APP-SWITCH" !== target.nodeName) {
            this._sortToggle.hasAttribute(ATBNAME) ? this._sortToggle.removeAttribute(ATBNAME) : this._sortToggle.setAttribute(ATBNAME, '');
        }
        this._sort = this._sortToggle.hasAttribute(ATBNAME);
        this._preferences.sorted = this._sort;
        PreferencesService.set('jsonView', this._preferences);
        this.source = this._resource;
    }

    templateToggleClick = ({ target }) => {
        const ATBNAME = 'data-checked';
        if ("APP-SWITCH" !== target.nodeName) {
            this._templateToggle.hasAttribute(ATBNAME) ? this._templateToggle.removeAttribute(ATBNAME) : this._templateToggle.setAttribute(ATBNAME, '');
        }
        this._template = this._templateToggle.hasAttribute(ATBNAME);
        this.showTemplate(this._template);
        if (this._template) {
            this._templateView.source = this._resource;
        }
        this._preferences.template = this._template;
        PreferencesService.set('jsonView', this._preferences);
    }

    contentClick = ({ target, offsetX, offsetY, ctrlKey }) => {
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
    };

    clear = () => {
        this._content.scrollTo(0, 0);
        this._content.innerHTML = "Loading...";
        this._content.style.cursor = "wait";
        this._resource = null;
    }

    get resourceType() {
        return this._resource.resourceType;
    }
    get resourceId() {
        return this._resource.id;
    }
    get source() {
        return this._resource;
    }

    /**
     * @param {object} resource
     */
    set source(resource) {
        this._content.scrollTo(0, 0);
        this._content.innerHTML = "";
        this._content.appendChild(document.createTextNode("{"));
        this._content.appendChild(this.parse(resource));
        this._content.appendChild(document.createTextNode("}"));
        this._content.style.cursor = "default";
        this._resource = resource;
        this._templateView.source = resource;
    }

    parse = (obj) => {
        let dl = document.createElement('dl');

        let entries = Object.entries(obj);
        if (this._sort) entries = entries.sort();
        entries.forEach(([key, value]) => {
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
                    let url = value.replace(`${FhirService.server.url}`, '')
                    if (!url.startsWith('/') && !url.startsWith('?')) url = `/${url}`;
                    let a = document.createElement('a');
                    a.setAttribute("href", `#${url}`);
                    a.appendChild(document.createTextNode(value));
                    valueElm.appendChild(a);
                } else {
                    valueElm.innerText = value;
                }
            } else if ("object" === typeof (value)) {
                dt.classList.add(Array.isArray(value) ? "array" : "object");
                valueElm.appendChild(this.parse(value));
            } else {
                valueElm.innerText = value;
            }
            dt.appendChild(valueElm);

            dl.appendChild(dt);
        });
        return dl;
    }

};
customElements.define('resource-json-view', ResourceJsonView);
