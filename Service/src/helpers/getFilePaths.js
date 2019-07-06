const klaw = require('klaw') 
const config = require('../../config.js')
const logJsonOutput = require('./logJsonOutput.js')
const path = require('path')


// create array of index files by iterating through files in the output folder
// amended to ensure that a relative file path is generated
module.exports = {
    async Execute() {
        
        // https://github.com/jprichardson/node-klaw/issues/30
        return new Promise((resolve, reject) => {
			let files = [];
            let i = 0;
            
            // klaw is a library that iterates through a folder to get files
			require('klaw')(config.outputFolder)
				.on('data', file => {
                    
                    // regex to resolve filename
                    //var filename = file.path.replace(/^.*[\\\/]/, '')
                    

                    // now create file name and file path pair
                    let filePathObj = path.parse(file.path);
                    let folder = path.relative(config.outputFolder, filePathObj.dir)
                    filePathObj.relativefilepath = "../" + folder + "/" + filePathObj.base

                    // however we only want to display the index page in the drop down menu
                    // and lets make it look nicer at the same time
					if (i > 0 && file.path.includes('index')) {
                        filePathObj.name = filePathObj.name.replace("index_", "")
                        filePathObj.name = filePathObj.name.replace("index", "Latest report")
						files.push(filePathObj);
					}
					i++;
				})
				.on('end', () => resolve(files))
				.on('error', (err, item) => reject(err, file));
		});
    }
}
