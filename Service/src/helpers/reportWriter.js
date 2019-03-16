const moment = require('moment')
const globals = require('./globals.js')
const config = require('../../config.js')
const transformFile = require('./transformFile.js')
const generateFile = require('./generateFile')


var cleanData = function (datain) {
    // payload
    let cleaned = null;
    // preserve newlines, etc - use valid JSON
    cleaned = datain.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
    // remove non-printable and other non-valid JSON chars
    cleaned = cleaned.replace(/[\u0000-\u0019]+/g, "");
    try {
        cleaned = JSON.parse(cleaned);
    } catch (e) {
        console.log(e);
    }
    return cleaned
};

module.exports = {
    async TransformAndWriteReport(reportFileObject, reportData, name) { 
        try {            
            if(config.debug) {console.log(`>> Creating ${reportFileObject.type} report for ${name}`)}
            var cleanedJsonData = cleanData(reportData)  
            // for reference:
            //      reportFileObject = {
            //          type: "",
            //          template: "",
            //          filePathToCreate: "" }
            var isIndex = false;
            var isArchiveIndex = false;
            var isArchiveTeamReport = false;
            if(reportFileObject.type === 'index') {
                isIndex = true;
            } else if(reportFileObject.type === 'archiveIndex')  {
                isArchiveIndex = true;
            } else if(reportFileObject.type === 'archiveTeamReport')  {
                isArchiveTeamReport = true;
            }
            // adding data for handlebars template
            var handlebarData = {
                CreatedDate: moment().format('Do MMMM YYYY, HH:mm:ss'),
                DaysForReferrals: globals.daysForReferrals,
                IsIndex: isIndex,
                IsArchiveIndex: isArchiveIndex,
                IsArchiveTeamReport: isArchiveTeamReport,
                FileString: reportFileObject.filePathToCreate,
                data: cleanedJsonData
            };
            // use handlebars to insert data into template html
            let html = await transformFile.Execute(reportFileObject.template, handlebarData)
            // create html file
            await generateFile.Execute((config.outputFolder + "/" + reportFileObject.filePathToCreate), html, reportFileObject.type)

        } catch(err) {
            console.error(err)
        }
    } 
};