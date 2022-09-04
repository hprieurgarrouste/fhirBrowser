customElements.define('json-viewer', class JsonViewer extends HTMLElement {
    connectedCallback() {
        let shadow = this.attachShadow({ mode: 'closed' });
        shadow.innerHTML = `
            <link rel="stylesheet" href="./material.css">
            <style>
                #content {
                    font-family: monospace;
                    color: var(--text-color-normal, black);
                    background-color: var(--background-color, white);
                    height: 100%;
                    overflow: auto;
                    padding: 0 8px;
                }
                dl {
                    margin: 0;
                    padding-left: 1.5em;
                }
                dt {
                    list-style-type: none;
                }
                span:first-of-type {
                    color: #8000FF;
                }
                span {
                    color: #800000;
                }
            </style>
            <div id="content"></div>
        `;
        this._content = shadow.getElementById("content");
    }
    /**
     * @param {object} object
     */
    set source(object) {
        this.parse(this._content, object);
    }
    parse(parent, obj) {
        let isArray = Array.isArray(obj);
        parent.appendChild(document.createTextNode(isArray ? '[' : '{'));
        let dl = document.createElement('dl');
        for (const [key, value] of Object.entries(obj)) {
            const dt = document.createElement('dt');
            if (!isArray) {
                const elm = this.buildKey(key);
                dt.appendChild(elm);
                dt.appendChild(document.createTextNode(": "));
            }
            if (typeof value === 'object') {
                this.parse(dt, value);
            } else {
                dt.appendChild(this.buildValue(value));
            }
            const prev = dl.lastElementChild;
            if (prev && prev.nodeName == dt.nodeName) {
                prev.appendChild(document.createTextNode(","));
            }
            dl.appendChild(dt);
        }
        parent.appendChild(dl);
        parent.appendChild(document.createTextNode(isArray ? ']' : '}'));
    }
    buildKey(key) {
        const elm = document.createElement('span');
        elm.innerText = `"${key}"`;
        return elm;
    }
    buildValue(value) {
        const elm = document.createElement('span');
        elm.innerText = (typeof (value) === 'string' ? `"${value}"` : value);
        return elm;
    }
});
