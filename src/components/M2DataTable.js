import template from "./templates/M2DataTable.html"

class M2DataTable extends HTMLElement {
    /** @type {HTMLTableRowElement} */
    #header;
    /** @type {HTMLTableSectionElement} */
    #body;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = template;

        this.#header = shadow.getElementById("header");
        this.#header.ondragstart = this.#onDragStart;
        this.#header.ondragover = this.#onDragOver;
        this.#header.ondragenter = this.#onDragEnter;
        this.#header.ondragleave = this.#onDragLeave;
        this.#header.ondragend = this.#onDragEnd;
        this.#header.ondrop = this.#onDragDrop;

        this.#body = shadow.getElementById("body");
        this.#body.onclick = this.#bodyClick;
    }

    #onColumnReorder = () => { };
    get onColumnReorder() {
        return this.#onColumnReorder;
    }
    set onColumnReorder(callback) {
        this.#onColumnReorder = callback;
    }

    addColumn = (title) => {
        const cell = document.createElement("th");
        cell.dataset.id = title;
        cell.setAttribute('draggable', 'true');
        cell.appendChild(document.createTextNode(title));

        this.#header.appendChild(cell);
    }

    addRow = (id, columns) => {
        let row = document.createElement("tr");
        row.id = id;
        Object.entries(columns).forEach(([, value]) => {
            row.insertAdjacentHTML('beforeend', `<td>${value}</td>`);
        })
        this.#body.appendChild(row);
    }

    #bodyClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const row = event.target.closest("tr");
        if (row) {
            this.#body.querySelector("tr[class~=selected]")?.classList.remove("selected");
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
        while (this.#header.firstChild) this.#header.removeChild(this.#header.lastChild);
        while (this.#body.firstChild) this.#body.removeChild(this.#body.lastChild);
    }

    #onDragStart = (event) => {
        const target = event.target.closest('th');
        target.style.opacity = '0.4';

        this.#header.classList.add('drag');
        this.dragSrcEl = target;
    }

    #onDragEnter = (event) => {
        event.target.closest('th')?.classList.add('over');
    }

    #onDragLeave = (event) => {
        event.target.closest('th')?.classList.remove('over');
    }

    #onDragOver = (event) => {
        event.preventDefault();
        const target = event.target.closest('th');
        if (this.dragSrcEl == target) {
            event.dataTransfer.dropEffect = 'none';
        } else {
            event.dataTransfer.dropEffect = 'move';
        }
        return false;
    }

    #onDragDrop = (event) => {
        event.stopPropagation();
        let target = event.target.closest('th');
        if (this.dragSrcEl != target) {
            const thArr = Array.from(this.#header.childNodes);
            const srcIdx = thArr.findIndex(th => th == this.dragSrcEl);
            const tgtIdx = thArr.findIndex(th => th == target);

            if (srcIdx < tgtIdx) {
                target = target.nextSibling;
            }
            this.#header.insertBefore(this.dragSrcEl, target);
            this.dragSrcEl = null;

            this.#onColumnReorder(Array.from(this.#header.childNodes).map(th => th.dataset.id));
        }

        return false;
    }

    #onDragEnd = (event) => {
        event.target.closest('th').style.opacity = '1';
        this.#header.classList.remove('drag');
        this.#header.childNodes.forEach(item => item.classList.remove('over'));
    }


};
customElements.define('m2-data-table', M2DataTable)
