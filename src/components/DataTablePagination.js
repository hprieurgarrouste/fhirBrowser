import template from "./templates/DataTablePagination.html";

import "./RoundButton";


class DataTablePagination extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'closed' }).innerHTML = template;
    }
};
customElements.define('data-table-pagination', DataTablePagination)
