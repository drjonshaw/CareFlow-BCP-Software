fse = require('fs-extra');   
const makeFolder = require('./makeFolder.js')
const config = require('../../config.js')

module.exports = {
    async logToFile(name, payload) {
        let dirPath = await makeFolder.Execute(config.outputFolder + "/json")
        file = dirPath + "/" + name + ".json";
        fse.writeJson(file, payload, {spaces: 4});
        console.log(">> Created log file " + file);
    }
}