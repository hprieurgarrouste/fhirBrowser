customElements.define('fhir-resources-list', class FhirResourcesList extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = `
            <style>
                ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                li {
                    cursor: pointer;
                    padding: 0.3em 1em;
                }
                li:hover, li.selected {
                    background-color:var(--hover-color, lightgray);
                }
            </style>
            <div id="wrapper"></div>
        `;
    }
    connectedCallback() {
        this._shadow.getElementById('wrapper').onclick = (event) => {
            if (event.target.nodeName === 'LI') {
                let prev = this._shadow.querySelector(".selected");
                if (prev) {
                    prev.classList.remove('selected');
                }
                event.target.classList.add('selected');
                this.dispatchEvent(new CustomEvent("click", {
                    bubbles: false,
                    cancelable: false,
                    'detail': {
                        resourceType: event.target.id
                    }
                }));
                event.stopPropagation();
            }
        };
    }

    /**
     * @param {object} metadata
     */
    set metadata(metadata) {
        async function buildUL() {
            const ul = document.createElement('ul');
            metadata.rest[0].resource.forEach(resource => {
                const li = document.createElement('li');
                li.id = resource.type;
                li.innerHTML = resource.type;
                ul.appendChild(li);
            })
            return ul;
        }
        buildUL().then(ul => {
            this._shadow.getElementById('wrapper').appendChild(ul);
        });
    }

    clear() {
        const wrapper = this._shadow.getElementById('wrapper');
        while (wrapper.firstChild) {
            wrapper.removeChild(wrapper.lastChild);
        }
    }
});