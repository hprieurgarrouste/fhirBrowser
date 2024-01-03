import template from "./templates/ResourceXmlView.html";

import "./components/M2Switch"

import context from "./services/Context"
import preferencesService from "./services/Preferences"
import snackbarService from "./services/Snackbar"

class ResourceXmlView extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = template;

        this._resource = null;

        this._content = shadow.getElementById('content');
        this._content.onclick = this.contentClick;

        this._preferences = preferencesService.get('xmlView', { 'sorted': false });

        this._sort = this._preferences.sorted;
        this._sortToggle = shadow.getElementById('sort-toggle');
        this._sortToggle.onclick = this.sortToggleClick;

        shadow.getElementById('download').onclick = this.downloadClick;

        shadow.getElementById('copy').onclick = this.copyClick;

        shadow.getElementById('share').onclick = this.shareClick;

    }

    connectedCallback() {
        this.sortChange();
    }

    sortToggleClick = () => {
        this._sort = !this._sort;
        preferencesService.set('xmlView', { 'sorted': this._sort });
        this.sortChange();
    }
    sortChange = () => {
        this._sortToggle.style.color = this._sort ? 'var(--primary-color)' : 'unset';
        if (this._resource) this.source = this._resource;
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
        this._content.scrollTo(0, 0);
        this._content.innerHTML = "Loading...";
        this._content.style.cursor = "wait";
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
        this._content.scrollTo(0, 0);
        this._content.innerHTML = this.parse(resource).outerHTML;
        this._content.style.cursor = "default";
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
                        let url = a.nodeValue.replace(`${context.server.url}`, '')
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

    downloadClick = () => {
        const content = new XMLSerializer().serializeToString(this._resource);
        const file = new File([content], this.resourceId, {
            'type': 'data:text/xml;charset=utf-8'
        });
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.resourceType}#${file.name}.xml`;
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    copyClick = () => {
        const content = new XMLSerializer().serializeToString(this._resource);
        navigator.clipboard.writeText(content).then(function () {
            SnackbarService.show("Copying to clipboard was successful");
        }, function (err) {
            SnackbarService.error("Could not copy text");
        });
    };

    shareClick = () => {
        const content = new XMLSerializer().serializeToString(this._resource);
        const fileName = `${this.resourceType}.${this.resourceId}.txt`;
        const file = new File([content], fileName, { type: 'text/plain' });
        navigator.share({
            "title": fileName,
            "files": [file]
        });
    };
}
customElements.define('resource-xml-view', ResourceXmlView);
