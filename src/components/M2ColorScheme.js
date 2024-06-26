import template from './templates/M2ColorScheme.html'

import preferencesService from '../services/Preferences'

export default class M2ColorScheme extends HTMLElement {
    /** @type {M2RoundButton} */
    #themeButton

    constructor () {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = template
        this.#themeButton = shadow.querySelector('m2-round-button')
        this.#themeButton.onclick = this.#clickHandler
    }

    connectedCallback () {
        this.#setColorScheme(preferencesService.get('colorScheme', 'auto'))
    }

    #clickHandler = (event) => {
        const schemes = ['light', 'dark', 'auto']
        let colorScheme = preferencesService.get('colorScheme', 'auto')
        const i = schemes.findIndex((elm) => elm === colorScheme) + 1
        colorScheme = schemes[i % 3]
        preferencesService.set('colorScheme', colorScheme)
        this.#setColorScheme(colorScheme)
    }

    #setColorScheme = (colorScheme) => {
        let colorSchemeIcon = ''
        let scheme = colorScheme
        switch (colorScheme) {
        case 'dark':
            colorSchemeIcon = 'brightness_4'
            break
        case 'light':
            colorSchemeIcon = 'light_mode'
            break
        case 'auto':
        default:
            if (colorScheme === 'auto') {
                if (window?.matchMedia('(prefers-color-scheme: dark)').matches) {
                    scheme = 'dark'
                } else {
                    scheme = 'light'
                }
            }
            colorSchemeIcon = 'brightness_auto'
            break
        }
        this.#themeButton.icon = colorSchemeIcon
        this.#themeButton.title = `Theme ${colorScheme}`
        document.body.setAttribute('color-scheme', scheme)
    }

    get value () {
        return preferencesService.get('colorScheme', 'auto')
    }
}

customElements.define('m2-color-scheme', M2ColorScheme)
