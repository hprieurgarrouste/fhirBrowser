(function () {
    class DataTable extends HTMLElement {
        constructor() {
            super();
            this.rowClickEvent = new CustomEvent("rowclick", {
                bubbles: false,
                cancelable: false,
            });
            const shadow = this.attachShadow({ mode: 'open' });
            shadow.appendChild(template.content.cloneNode(true));
            this._header = shadow.getElementById("header");
            this._body = shadow.getElementById("body");
        }
        addColumn(title) {
            let cell = document.createElement("th");
            let cellText = document.createTextNode(title);
            cell.appendChild(cellText);
            this._header.appendChild(cell);
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
                event.stopPropagation();
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
            }
        }
        clear() {
            while (this._header.firstChild) this._header.removeChild(this._header.lastChild);
            this.removeAll();
        }
        removeAll() {
            while (this._body.firstChild) this._body.removeChild(this._body.lastChild);
        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <link href="./assets/material.css" rel="stylesheet"/>
        <style>
            div {
                height:100%;
                overflow:auto;
            }
            table {
                border-collapse: collapse;
                min-width: 100%;
                white-space: nowrap;
            }
            thead {
                background-color: var(--background-color);
                box-shadow: 0 2px 4px var(--border-color);
                position: sticky;
                top: 0;
            }
            th, td {
                height: 56px;
                padding: 1px 16px;
                text-align: left;
            }
            tbody tr {
                border-bottom: 1px solid var(--border-color, gray);
                cursor:pointer;
            }
            tbody tr:hover, tbody tr.selected {
                background-color: var(--hover-color, rgb(0 0 0 / 4%));
            }
        </style>
        <div>
            <table>
                <thead>
                    <tr id="header"></tr>
                </thead>
                <tbody id="body"></tbody>
            </table>
        </div>
    `;


    window.customElements.define('data-table', DataTable);
})();