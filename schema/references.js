/**
 * download NPM core archive from official site
 * ex: https://hl7.org/fhir/R4/hl7.fhir.r4.core.tgz
 * extract package/SearchParameter-*.json files in a subfolder named as the corresponding Fhir version (R4,R5,...)
 * execute this tool
 */

const fs = require('fs');

const results = {};

const path = "./";
const versions = fs.readdirSync(path).filter(function (file) {
    return fs.statSync(`${path}${file}`).isDirectory();
})
versions.forEach(version => {
    const result = {};
    const folder = `${path}${version}/`;
    const filenames = fs.readdirSync(folder);
    filenames.filter(file => file.startsWith("SearchParameter-")).forEach(file => {
        console.log(`${folder}${file}`);
        let rawdata = fs.readFileSync(`${folder}${file}`);
        try {
            let searchParameter = JSON.parse(rawdata);
            if ("reference" == searchParameter.type && searchParameter.target) {
                searchParameter.target.forEach(target => {
                    let resourceTarget = result[target];
                    if (!resourceTarget) {
                        resourceTarget = {};
                        result[target] = resourceTarget;
                    }
                    searchParameter.base.forEach(base => {
                        let resourceBase = resourceTarget[base];
                        if (!resourceBase) {
                            resourceBase = [];
                            resourceTarget[base] = resourceBase;
                        }
                        resourceBase.push(searchParameter.name);
                    });
                });
            }
        } catch (e) {
            console.log(`ERROR`);
        }
    });
    results[version] = result;
});
fs.writeFileSync(`../src/assets/references.json`, JSON.stringify(results));
