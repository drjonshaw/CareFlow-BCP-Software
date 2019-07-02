const axios = require('axios')
const qs = require('querystring')
const config = require('../../config.js')
const logJsonOutput = require('../helpers/logJsonOutput.js')
const globals = require('../helpers/globals.js')


module.exports = {
    async GetTasksMetaData (token, networkID) {
        try {
            let data = null

            const url = `${globals.urlscheme}${config.environment}${globals.appHost}/Networks/${networkID}/TasksMetaData`
            const headerContent = {
                  'Authorization': 'Bearer ' + token,
                  'Accept': 'application/json;version=10',
                  'Content-Type': 'application/json;charset=UTF-8',
                  'Cache-Control': 'no-cache',
                  'API-Key': 'FF99FF99-FF99-FF99-FF99-FF99FF99FF99'
                }
            let response = await axios.get(url, {headers: headerContent})

            if (!(/^2/.test('' + response.status))) { // Status Codes other than 2xx 
                console.error("GetTasksMetaData API call error: Status code: " + response.status);
            }
            else {
                if(config.debug) {
                    if(config.debug){
                        //console.log(">> GetTeams API call success: Status code: " + response.status);
                        logJsonOutput.logToFile("TaskMetaData", response.data)
                    }
                }
                return response.data;
            }
                 
        } catch (err) {
            console.log(err)
        }
    }
}