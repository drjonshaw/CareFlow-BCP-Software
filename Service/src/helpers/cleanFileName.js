const config = require('../../config.js')

// clearFileName
module.exports = {
    Execute(fileName) {
        var reservedCharacters = /[/\\?%*:|"<>]/g
        try {
            if (reservedCharacters.test(fileName)) {
                fileName2 = fileName.replace(/[/\\?%*:|"<>]/g, '_');
                if(config.debug) {
                    console.log('Removed reserved characters from Team name ' + fileName + ' . New filename: ' + fileName2)                       
                } 
                fileName = fileName2
            }    
            return fileName         
        } catch (err) {
            console.error(err)
        }        
    }
}