import template from "./templates/fhirResourceXml.html";

class FhirResourceXml extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
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
        content.style.cursor = "default";

        content.innerHTML = parse(resource).outerHTML;

        function parse(obj) {
            let dl = document.createElement('dl');
            Array.from(obj.children).forEach(e => {
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
                        val.innerText = `"${a.nodeValue}"`;
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
