const fse = require('fs-extra') // https://github.com/jprichardson/node-fs-extra
const config = require('../../config.js')

// makeFile
module.exports = {
    async Execute(sourceFilePath, copiedFilePath) {
        try {
            let res = await fse.copy(sourceFilePath, copiedFilePath)
            if(config.debug) {
                console.log('>> Copied file to ' + copiedFilePath)                       
            }    
            return copiedFilePath
        } catch (err) {
            console.error(err) 
        }
    }
}

