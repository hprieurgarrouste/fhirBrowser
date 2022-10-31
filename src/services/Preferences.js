export class PreferencesService {
    static {
        this.KEY = 'preferences';
    }

    static get(key, defaultValue = null) {
        const lsp = localStorage.getItem(this.KEY);
        let preferences = null;
        if (lsp !== null) {
            preferences = JSON.parse(lsp);
        } else {
            return defaultValue;
        }
        return preferences[key] || defaultValue;
    }

    static set(key, value) {
        const lsp = localStorage.getItem(this.KEY);
        let preferences = null;
        if (lsp !== null) {
            preferences = JSON.parse(lsp);
        } else {
            preferences = {};
        }
        preferences[key] = value;
        localStorage.setItem(this.KEY, JSON.stringify(preferences));
    }
}