import template from './templates/ServerList.html'

import M2List from '../components/M2List'
import M2ListItem from '../components/M2ListItem'
import M2ListRow from '../components/M2ListRow'
import ServerConfiguration from './ServerConfiguration'

export default class ServerList extends HTMLElement {
    /** @type {M2List} */
    #list

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template

        this.onclick = () => { }

        this.#list = shadow.querySelector('m2-list')
        this.#list.onclick = this.#appListClick
    }

    /**
     * @param {PointerEvent} event
     */
    #appListClick = (event) => {
        event.preventDefault()
        event.stopPropagation()
        const row = event.target.closest('m2-list-row')
        if (row) {
            this.onclick(row.dataset.id)
        }
    }

    load (values) {
        this.#list.clear()
        this.#list.append(...Object.keys(values)
            .sort((k1, k2) => k1.localeCompare(k2))
            .map(key => {
                const row = new M2ListRow()
                row.setAttribute('data-id', key)
                row.appendChild(new M2ListItem(undefined, key, values[key].url))
                return row
            }))
    }

    get value () {
        return this.#list.querySelector('m2-list-row[selected]')?.dataset.id
    }

    set value (serverKey) {
        this.#list.querySelector('m2-list-row[selected]')?.removeAttribute('selected')
        const row = this.#list.querySelector(`m2-list-row[data-id="${serverKey}"]`)
        if (row) {
            row.setAttribute('selected', 'true')
            row.scrollIntoView()
        }
    }
};
customElements.define('server-list', ServerList)
