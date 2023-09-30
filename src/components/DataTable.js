import template from "./templates/DataTable.html";

(function () {
    class DataTable extends HTMLElement {
        constructor() {
            super();
            this.rowClickEvent = new CustomEvent("rowclick", {
                bubbles: false,
                cancelable: false,
            });
            const shadow = this.attachShadow({ mode: 'open' });
            shadow.innerHTML = template;
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
    customElements.define('data-table', DataTable)
})();