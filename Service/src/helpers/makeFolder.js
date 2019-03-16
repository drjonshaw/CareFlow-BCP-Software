const fse = require('fs-extra') // https://github.com/jprichardson/node-fs-extra
const config = require('../../config.js')

// makeFolder
module.exports = {
    async Execute(folderPath) {
        try {
            let res = await fse.ensureDir(folderPath)
            if(res && config.debug) {
                console.log('>> Created new folder ' + res)                       
            }    
            return folderPath         
        } catch (err) {
            console.error(err)
        }        
    }
}