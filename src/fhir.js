export class Fhir {
    static server = null;

    static async capabilities(mode = "full") {
        const url = new URL(`${this.server.url}/metadata`);
        url.searchParams.set("mode", mode);
        url.searchParams.set("_format", "json");
        const response = await fetch(url, {
            "cache": "reload",
            "headers": this.server.headers
        });
        return response.json();
    }

    static async read(type, id) {
        const url = new URL(`${this.server.url}/${type}/${id}`);
        url.searchParams.set("_format", "json");
        const response = await fetch(url, {
            "headers": this.server.headers
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
            "headers": this.server.headers
        });
        return response.json();
    }

    static async searchCount(type, parameters = []) {
        const url = new URL(`${this.server.url}/${type}`);
        url.searchParams.set("_summary", "count");
        url.searchParams.set("_format", "json");
        parameters.forEach(parameter => {
            url.searchParams.set(parameter.name, parameter.value);
        });
        const response = await fetch(url, {
            "headers": this.server.headers
        });
        return response.json();
    }

}