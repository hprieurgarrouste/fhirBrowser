customElements.define('data-table', class DataTable extends HTMLElement {
    constructor() {
        super();
        this.rowClickEvent = new CustomEvent("rowclick", {
            bubbles: false,
            cancelable: false,
        });
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <link href="./material.css" rel="stylesheet"/>
            <style>
                div {
                    background-color: var(--background-color, white);
                    border: 1px solid var(--border-color, gray);
                    border-radius: 4px;
                    height:100%;
                }
                table {
                    border: 0;
                    white-space: nowrap;
                    border-collapse: collapse;
                    display:flex;
                    flex-direction:column;
                    height:100%;
                }
                thead, tbody tr, tfoot {
                    display:table;
                    width:100%;
                    table-layout:fixed;
                }
                thead {
                    width: calc( 100% - 5px );
                }
                th {
                    text-align: left;
                    height: 56px;
                    padding-right: 16px;
                    padding-left: 16px;
                    overflow:hidden;
                }
                tbody {
                    border-top: 1px solid var(--border-color, gray);
                    display:block;
                    overflow-y:auto;
                    flex: 1 1 auto;
                }
                tbody tr {
                    cursor:pointer;
                    border-bottom: 1px solid var(--border-color, gray);
                }
                tbody tr:hover, tbody tr.selected {
                    background-color: var(--hover-color, rgba(0, 0, 0, 5%));
                }
                tbody td {
                    height: 52px;
                    padding-right: 16px;
                    padding-left: 16px;
                    overflow:hidden;
                    text-overflow: ellipsis;
                }
                tfoot {
                    border-top: 1px solid var(--border-color, gray);
                }
                tfoot td {
                    text-align: right;
                    overflow: hidden;
                }
            </style>
            <div>
                <table>
                    <thead>
                        <tr id="header"></tr>
                    </thead>
                    <tbody id="body">
                    </tbody>
                    <tfoot>
                        <tr>
                            <td id="footer">
                                <slot name="footer"/>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        this._header = shadow.getElementById("header");
        this._body = shadow.getElementById("body");
        this._footerCell = shadow.getElementById("footer");
    }
    addColumn(title) {
        let cell = document.createElement("th");
        let cellText = document.createTextNode(title);
        cell.appendChild(cellText);
        this._header.appendChild(cell);
        this._footerCell.colSpan = this._header.childElementCount;
    }
    addRow(id, columns) {
        let row = document.createElement("tr");
        row.id = id;
        for (const [, value] of Object.entries(columns)) {
            row.insertAdjacentHTML('beforeend', `<td>${value}</td>`);
        }
        row.addEventListener("click", onRowClick.bind(this));
        this._body.appendChild(row);
        function onRowClick(event) {
            let prev = this._body.querySelector(".selected");
            if (prev) {
                prev.classList.remove('selected');
            }
            let target = event.target;
            while (target && target.nodeName !== 'TR') target = target.parentNode;
            if (target) {
                target.classList.add('selected');
                this.dispatchEvent(new CustomEvent("rowclick", {
                    bubbles: false,
                    cancelable: false,
                    'detail': {
                        resourceId: target.id
                    }
                }));
            }
            event.stopPropagation();
        }
    }
    removeAll() {
        while (this._body.firstChild) this._body.removeChild(this._body.lastChild);
    }
});
