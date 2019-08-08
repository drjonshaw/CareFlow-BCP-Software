const fse = require('fs-extra');
const handlebars = require('handlebars');
const moment = require('moment');

// helper function to format ISO dates in the report
// https://momentjs.com/
var DateFormats = {
  short: 'DD/MM/YYYY',
  long: 'LLLL',
};
handlebars.registerHelper('formatDate', function(datetime, format) {
  if (moment) {
    // can use other formats like 'lll' too
    format = DateFormats[format] || format;
    return moment(datetime).format(format);
  } else {
    return datetime;
  }
});

//handlebars helper - IE and Edge have issues with the AA part of a hex representation; this will strip the last 2 chars (AA etc)
handlebars.registerHelper('splitProfileColourString', function(string) {
  try {
    if (!string || string.length <= 6) return string;
    return string.slice(0, 6);
  } catch (e) {
    return string;
  }
});

// makeFile
module.exports = {
  async Execute(templateFilePath, templateData) {
    try {
      let originalHtml = fse.readFileSync(templateFilePath, 'utf8');
      let template = handlebars.compile(originalHtml);
      let newHtml = template(templateData);
      return newHtml;
    } catch (err) {
      console.error(err);
    }
  },
};
