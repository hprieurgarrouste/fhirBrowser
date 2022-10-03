export class Preferences {
    static KEY = 'preferences';
    static get(key, defaultValue = null) {
        const lsp = localStorage.getItem(Preferences.KEY);
        let preferences = null;
        if (lsp !== null) {
            preferences = JSON.parse(lsp);
        } else {
            return defaultValue;
        }
        return preferences[key] || defaultValue;
    }
    static set(key, value) {
        const lsp = localStorage.getItem(Preferences.KEY);
        let preferences = null;
        if (lsp !== null) {
            preferences = JSON.parse(lsp);
        } else {
            preferences = {};
        }
        preferences[key] = value;
        localStorage.setItem(Preferences.KEY, JSON.stringify(preferences));
    }
}