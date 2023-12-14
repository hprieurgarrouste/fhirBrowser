import template from "./templates/AppList.html";

import "./ListFilter";

class AppList extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._list = null;
        this._slot = null;
        this._onFilter = null;
    }

    connectedCallback() {
        this._list = this._shadow.getElementById('list');
        this._slot = this._shadow.querySelector('slot');
        this._filter = this._shadow.querySelector('list-filter');
        this._filter.hidden = (this._slot.children.length <= 10);
        this._slot.addEventListener('slotchange', () => {
            this._filter.hidden = (('function' !== typeof this._onFilter) || this._slot.assignedNodes().length <= 10);
        });
        this._filter.onChange = ((value) => {
            if (('function' == typeof this._onFilter)) {
                if (value == '') this._list.scrollTop = 0;
                this._onFilter(value);
            }
        });
    }

    clear = () => {
        this._slot.assignedNodes().forEach(e => this.removeChild(e));
        this._filter.clear();
        this._list.scrollTop = 0;
    }

    get onFilter() {
        return this._onFilter;
    }
    set onFilter(filterFct) {
        this._onFilter = filterFct;
    }


};

customElements.define('app-list', AppList)

