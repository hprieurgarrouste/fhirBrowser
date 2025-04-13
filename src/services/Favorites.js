import PreferencesService from './Preferences'

class FavoritesService {
    /** @type {Array.function} */
    #favoritesListener = []

    #dispatchChange = () => {
        this.#favoritesListener.forEach(callback => {
            callback.call()
        })
    }

    addListener = (callback) => {
        this.#favoritesListener.push(callback)
    }

    /**
     * @returns {Array.string} - List of favorites
     */
    get favorites () {
        return PreferencesService.get('favorites', [])
    }

    /**
     * @param {string} resourceType - Type of resource
     */
    toggle = (resourceType) => {
        let favorites = this.favorites
        if (!favorites.includes(resourceType)) {
            favorites.push(resourceType)
        } else {
            favorites = this.favorites.filter(f => f !== resourceType)
        }
        PreferencesService.set('favorites', favorites)
        this.#dispatchChange()
    }
}

export default new FavoritesService()
