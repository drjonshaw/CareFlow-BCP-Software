const fse = require('fs-extra') // https://github.com/jprichardson/node-fs-extra
const config = require('../../config.js')

// generateFile
module.exports = {
    async Execute(filename, html, type) {
        try {
            let res = await fse.outputFile(filename, html)
            if(res && config.debug) {
                console.log(`>> Created new ${type} file: ${res}`)                       
            }    
            return res
        } catch (err) {
            console.error(err) 
        }
    }
}
