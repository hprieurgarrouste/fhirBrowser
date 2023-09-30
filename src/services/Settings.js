export class SettingsService {
    static {
        this.KEY = 'conf';
    }

    static async getAll() {
        let conf = localStorage.getItem(this.KEY);
        if (conf === null) {
            return await fetch(`./default.conf`, { "cache": "reload" })
                .then(response => response.json())
                .then(conf => {
                    localStorage.setItem(this.KEY, JSON.stringify(conf));
                    return conf;
                });
        } else {
            return JSON.parse(conf);
        }
    }

    static async get(key) {
        return await this.getAll().then(conf => {
            return conf[key]
        });
    }

}