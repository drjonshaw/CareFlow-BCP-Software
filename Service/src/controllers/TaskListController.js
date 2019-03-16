const axios = require('axios')
const moment = require('moment')
const config = require('../../config.js')
const globals = require('../helpers/globals.js')
const logJsonOutput = require('../helpers/logJsonOutput.js')
const itemsPerPage = 50

module.exports = {
    async GetTasks (token, accessGroupId) {
        try {
            let tasks = []
            let page = 0
            let thereAreMore = true
            while(thereAreMore) {
                let res = await reqTasks(token, accessGroupId, page)
                await tasks.push.apply(tasks, res.Data)
                page++
                if(!res.Metadata.Pagination.ThereAreMore) {
                    thereAreMore = false;
                    return tasks
                }
            }
            
        } catch(err) {
            console.error(err)
        }
    }
}

const reqTasks = async (token, accessGroupId, page) => {
    try {
        var now = moment().toISOString();
        var from = moment().subtract(config.daysForTasks, 'days').toISOString();

        let postBody = {
            AllocatedToAccessGroupIds: [accessGroupId], 
            Date: {
                    After: from, 
                    Before: null
            },
            ItemsPerPage: itemsPerPage,
            NetworkId: globals.networkid,
            OnlyTasksAssignedToMe: false,
            OnlyTasksCreatedByMe: false,
            Page: page,
            PatientExternalIdentifiers: [],
            StatusIds: [1],
            Urgent: null       
          }
        const url = `${globals.urlscheme}${config.environment}${globals.appHost}/Tasks/List`
        const headerContent = {
              'Authorization': 'Bearer ' + token,
              'Accept': 'application/json;version=10',
              'Content-Type': 'application/json;charset=UTF-8',
              'Cache-Control': 'no-cache'
            }
        let res = await axios.post(url, postBody, {headers: headerContent})
        //if(config.debug){console.log(`>> Returned TaskList from Careflow API. Status code ${res.status}`)}

        if (res.status === 200) {                
            //if(config.debug){logJsonOutput.logToFile(`TaskList_Team${accessGroupId}`, res.data.Data)}
            return res.data
        } else {
            console.error(`Status code: ${res.data.Messages.code}, Message: '${res.data.Messages.Message}'`)
        }
    } catch(err) {
        console.error(err)
        process.exit(1)
    }
}