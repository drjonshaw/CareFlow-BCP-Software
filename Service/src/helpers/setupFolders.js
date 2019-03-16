const moment = require('moment')
const config = require('../../config.js')
const globals = require('./globals.js')
const makeFolder = require('./makeFolder.js')
const copyFile = require('./copyFile.js')




module.exports = {
    async CreateFilesAndFolders(outputFolder) {
        try {
                if(!config.debug) {console.log(`>> setting up files and folders`)}
                else { console.log(`>> to reduce console output, set 'debug: false' in config.js file`)}
                // create output folder if doesnt exist
                let outputDirPath = await makeFolder.Execute(outputFolder)

                // create 'latest' folder if doesnt exist
                let latestDirPath = await makeFolder.Execute(outputDirPath + "/" + globals.latestFolderName)
                // copy logo in
                await copyFile.Execute((globals.resourceFolder + "/" + globals.logoFile), (latestDirPath + "/" + globals.logoFile))

                // place css file in latest folder
                var cssSourceFilePath = globals.resourceFolder + "/" + globals.cssTemplate
                var latestCssWriteFilePath = latestDirPath + "/" + globals.cssTemplate
                let latestCssFilePath = await copyFile.Execute(cssSourceFilePath, latestCssWriteFilePath)                

                // create 'archive' folder representing todays BCP activity if doesn't exist
                globals.archiveFolderName = moment().format('YYYY-MM-DD');
                let archiveDirPath = await makeFolder.Execute(outputDirPath + "/" + globals.archiveFolderName)
                // copy logo in
                await copyFile.Execute((globals.resourceFolder + "/" + globals.logoFile), (archiveDirPath + "/" + globals.logoFile))

                // place css file in archive folder
                var archiveCssWriteFilePath = archiveDirPath + "/" + globals.cssTemplate                
                var archiveCssFilePath = await copyFile.Execute(cssSourceFilePath, archiveCssWriteFilePath)

                // create the filename prefix string for BCP files being stored in the archive folder when running data importer later in the script                
                if(config.archivingIntervalInHours) {
                    globals.archiveFileNamePrefix = await MakeArchiveFileNameExtention(config.archivingIntervalInHours)
                } else {
                    globals.archiveFileNamePrefix = await MakeArchiveFileNameExtention(globals.defaultArchivingIntervalInHours)
                }
                if(config.debug) { console.log(`>> Archive file prefix for this batch will be '${globals.archiveFileNamePrefix}'`) }

        } catch(err) {
            console.error(err)
        }
    }
}

const MakeArchiveFileNameExtention = async (archivingIntervalInHours) => {
    // files within the archive folder will get overwritten up until a certain point and then a new increment of.. 
    // ..files will be created by using a naming convention

    /// calculate the archive interval to create file name prefix convention
    var dayStart = moment().format('YYYY-MM-DD 00:00:00');
    var current = moment().format('YYYY-MM-DD HH:mm:ss');
    var minutesDiff = moment(current).diff(dayStart, 'minutes');
    var minutesRatio = minutesDiff / (parseInt(archivingIntervalInHours) * 60);
    var startTime = (Math.floor(minutesRatio) * archivingIntervalInHours);
    var endTime = startTime + (parseInt(archivingIntervalInHours));

    /// format file name prefix
    var filePrefix;
    if (startTime < 12) { filePrefix = moment().format('YYYY-MM-DD') + " 0" + startTime.toString() + ".00"; }
    else { filePrefix = moment().format('YYYY-MM-DD') + " " + startTime.toString() + ".00"; }
    if (endTime < 12) { filePrefix = filePrefix + "-0" + endTime.toString() + ".00" }
    else { filePrefix = filePrefix + "-" + endTime.toString() + ".00" }
    
    return filePrefix
}

