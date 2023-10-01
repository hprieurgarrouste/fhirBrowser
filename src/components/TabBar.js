import template from "./templates/TabBar.html";

class TabBar extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
    }
    connectedCallback() {
        this._shadow.querySelector("main").onclick = (event) => {
            if (event.target.nodeName === 'APP-TAB') {
                this.select(event.target.id);
                event.stopPropagation();
            }
        };
    }

    select(id) {
        const tab = this._shadow.querySelector('slot').assignedElements().filter(tab => tab.id === id)[0];
        if (tab) {
            this._shadow.querySelector('slot').assignedElements().forEach(t => t.removeAttribute('selected'));
            tab.setAttribute("selected", "selected");
            this.dispatchEvent(new CustomEvent("click", {
                bubbles: false,
                cancelable: false,
                'detail': {
                    "tab": tab
                }
            }));

        }
    }
};
customElements.define('tab-bar', TabBar);

