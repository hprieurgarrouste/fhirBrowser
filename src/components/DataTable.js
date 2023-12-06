import template from "./templates/DataTable.html";

class DataTable extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'open' });
        this._shadow.innerHTML = template;
        this._onColumnReorder = () => { };
    }

    connectedCallback() {
        this._header = this._shadow.getElementById("header");
        this._header.ondragstart = this.onDragStart;
        this._header.ondragover = this.onDragOver;
        this._header.ondragenter = this.onDragEnter;
        this._header.ondragleave = this.onDragLeave;
        this._header.ondragend = this.onDragEnd;
        this._header.ondrop = this.onDragDrop;

        this._body = this._shadow.getElementById("body");
        this._body.onclick = this.bodyClick;
    }

    get onColumnReorder() {
        return this._onColumnReorder;
    }
    set onColumnReorder(callback) {
        this._onColumnReorder = callback;
    }

    addColumn = (title) => {
        const cellText = document.createTextNode(title);
        const cell = document.createElement("th");
        cell.dataset.id = title;
        cell.appendChild(cellText);
        cell.setAttribute('draggable', 'true');

        this._header.appendChild(cell);
    }

    addRow = (id, columns) => {
        let row = document.createElement("tr");
        row.id = id;
        Object.entries(columns).forEach(([, value]) => {
            row.insertAdjacentHTML('beforeend', `<td>${value}</td>`);
        })
        this._body.appendChild(row);
    }

    bodyClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const row = event.target.closest("tr");
        if (row) {
            this._body.querySelector("tr[class~=selected]")?.classList.remove("selected");
            row.classList.add('selected');
            this.dispatchEvent(new CustomEvent("rowclick", {
                bubbles: false,
                cancelable: false,
                'detail': {
                    resourceId: row.id
                }
            }));
        }
    }

    clear = () => {
        while (this._header.firstChild) this._header.removeChild(this._header.lastChild);
        this.removeAll();
    }

    removeAll = () => {
        while (this._body.firstChild) this._body.removeChild(this._body.lastChild);
    }

    onDragStart = (event) => {
        const target = event.target.closest('th');
        target.style.opacity = '0.4';

        this._header.classList.add('drag');
        this.dragSrcEl = target;
    }

    onDragEnter = (event) => {
        event.target.closest('th')?.classList.add('over');
    }

    onDragLeave = (event) => {
        event.target.closest('th')?.classList.remove('over');
    }

    onDragOver = (event) => {
        event.preventDefault();
        const target = event.target.closest('th');
        if (this.dragSrcEl == target) {
            event.dataTransfer.dropEffect = 'none';
        } else {
            event.dataTransfer.dropEffect = 'move';
        }
        return false;
    }

    onDragDrop = (event) => {
        event.stopPropagation();
        let target = event.target.closest('th');
        if (this.dragSrcEl != target) {
            const thArr = Array.from(this._header.childNodes);
            const srcIdx = thArr.findIndex(th => th == this.dragSrcEl);
            const tgtIdx = thArr.findIndex(th => th == target);

            if (srcIdx < tgtIdx) {
                target = target.nextSibling;
            }
            this._header.insertBefore(this.dragSrcEl, target);
            this.dragSrcEl = null;

            this._onColumnReorder(Array.from(this._header.childNodes).map(th => th.dataset.id));
        }

        return false;
    }

    onDragEnd = (event) => {
        event.target.closest('th').style.opacity = '1';
        this._header.classList.remove('drag');
        this._header.childNodes.forEach(item => item.classList.remove('over'));
    }


};
customElements.define('data-table', DataTable)
