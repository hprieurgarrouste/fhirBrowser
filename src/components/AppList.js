import template from "./templates/AppList.html";

import "./ListFilter";

class AppList extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.innerHTML = template;
        this._list = this._shadow.getElementById('list');
        this._slot = this._shadow.querySelector('slot');
        this._slot.addEventListener('slotchange', this.slotChange);
        this._filter = this._shadow.querySelector('list-filter');
        this._filter.onChange = this.filterChange;
    }

    connectedCallback() {
        this._filter.hidden = (this._slot.children.length <= 10);
    }

    _onFilter = (value) => { }
    get onFilter() {
        return this._onFilter;
    }
    set onFilter(filterFct) {
        this._onFilter = filterFct;
    }
    filterChange = (value) => {
        if (value == '') this._list.scrollTop = 0;
        this._onFilter(value);
    }

    slotChange = () => {
        this._filter.hidden = (('function' !== typeof this._onFilter) || this._slot.assignedNodes().length <= 10);
    }

    clear = () => {
        this._slot.assignedNodes().forEach(e => this.removeChild(e));
        this._filter.clear();
        this._list.scrollTop = 0;
    }



};

customElements.define('app-list', AppList)

