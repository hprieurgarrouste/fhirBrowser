export class FhirService {
    static {
        this._server = null;
    }

    static set server(srv) {
        this._server = srv;
    }
    static get server() {
        return this._server;
    }

    static async capabilities(mode = "full") {
        const url = new URL(`${this._server.url}/metadata`);
        url.searchParams.set("mode", mode);
        url.searchParams.set("_format", "json");
        const response = await fetch(url, {
            "cache": "reload",
            "headers": this._server.headers
        });
        return response.json();
    }

    static async read(type, id) {
        const url = new URL(`${this._server.url}/${type}/${id}`);
        url.searchParams.set("_format", "json");
        const response = await fetch(url, {
            "headers": this._server.headers
        });
        return response.json();
    }

    static async searchByLink(linkUrl, parameters = []) {
        const url = new URL(linkUrl);
        url.searchParams.set("_summary", "true");
        url.searchParams.set("_format", "json");
        parameters.forEach(parameter => {
            url.searchParams.set(parameter.name, parameter.value);
        });
        const response = await fetch(url, {
            "headers": this._server.headers
        });
        return response.json();
    }

    static async searchCount(type, parameters = []) {
        const url = new URL(`${this._server.url}/${type}`);
        url.searchParams.set("_summary", "count");
        url.searchParams.set("_format", "json");
        parameters.forEach(parameter => {
            url.searchParams.set(parameter.name, parameter.value);
        });
        const response = await fetch(url, {
            "headers": this._server.headers
        });
        return response.json();
    }

}