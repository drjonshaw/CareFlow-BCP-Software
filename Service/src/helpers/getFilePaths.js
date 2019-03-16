const klaw = require('klaw') 
const config = require('../../config.js')
const logJsonOutput = require('./logJsonOutput.js')


// create array of index files in output folder
module.exports = {
    async Execute(dir) {
        
        // https://github.com/jprichardson/node-klaw/issues/30
        return new Promise((resolve, reject) => {
			let files = [];
            let i = 0;
            
            // klaw is a library that iterates through a folder to get files
			require('klaw')(dir)
				.on('data', file => {
                    
                    // regex to resolve filename
                    var filename = file.path.replace(/^.*[\\\/]/, '')

                    // now create file name and file path pair
                    let filePathObj = {};
                    filePathObj.FileName = filename
                    filePathObj.FilePath = file.path

                    // however we only want to display the index page in the drop down menu
					if (i > 0 && file.path.includes('index')) {
						files.push(filePathObj);
					}
					i++;
				})
				.on('end', () => resolve(files))
				.on('error', (err, item) => reject(err, file));
		});
    }
}
