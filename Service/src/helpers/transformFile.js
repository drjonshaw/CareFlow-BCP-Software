const fse = require('fs-extra') 
const handlebars = require('handlebars')
const moment = require('moment')

// helper function to format ISO dates in the report
// https://momentjs.com/
var DateFormats = {
    short: "DD/MM/YYYY",
    long: "LLLL"
};
handlebars.registerHelper("formatDate", function(datetime, format) {
    if (moment) {
      // can use other formats like 'lll' too
      format = DateFormats[format] || format;
      return moment(datetime).format(format);
    }
    else {
      return datetime;
    }
  });


// makeFile
module.exports = {
    async Execute(templateFilePath, templateData) {
        try {            
            let originalHtml = fse.readFileSync(templateFilePath, "utf8")
            let template = handlebars.compile(originalHtml)
            let newHtml = template(templateData)                
            return newHtml
        } catch (err) {
            console.error(err) 
        }
    }
}
