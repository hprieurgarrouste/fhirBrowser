import "./RoundButton.js";

customElements.define('data-table-pagination', class DataTablePagination extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'closed' });
        this._shadow.appendChild(DataTablePaginationTemplate.content.cloneNode(true));
    }
});

const DataTablePaginationTemplate = document.createElement('template');
DataTablePaginationTemplate.innerHTML = `
    <link rel="stylesheet" href="./assets/material.css">
    <style>
        main {
            align-items: center;
            display: flex;
            flex-direction:row;
            font-family: inherit;
            font-size: .875rem;
            padding: 0.5em;
            text-align:right;
            white-space: nowrap;
        }
        .rows {
            margin: 0 24px;
            flex: auto;
        }
    </style>
    <main>
        <div class="rows"><slot name="rows"></slot></div>
        <div class="arrows"><slot name="arrows"></slot></div>
    </main>
`;