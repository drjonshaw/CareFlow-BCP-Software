const axios = require('axios')
const moment = require('moment')
const config = require('../../config.js')
const globals = require('../helpers/globals.js')
const logJsonOutput = require('../helpers/logJsonOutput.js')
const itemsPerPage = 50

module.exports = {
    async GetReferrals (token, groupExternalIdentifier) {
        try {
            let referrals = []
            let skip = 0
            let take = 50
            let thereAreMore = true
            while(thereAreMore) {
                let res = await reqReferrals(token, groupExternalIdentifier, skip, take)
                await referrals.push.apply(referrals, res.Data)
                skip += take
                if(!res.Metadata.Pagination.ThereAreMore) {
                    thereAreMore = false;
                    let returnedReferrals = await modifyReferralData(referrals, groupExternalIdentifier)
                    return returnedReferrals
                }
            }
            
        } catch(err) {
            console.error(err)
        }
    }
}

// function for modifying parts of the data for the UI to use
const modifyReferralData = async(referrals, groupExternalIdentifier) => {
    let modifiedReferrals = []
    referrals.forEach((item) => {
        if(item.Referral.ReceivingMemberArea.Identifier === groupExternalIdentifier) {
            item.Referral.TypeToDisplay = "From";
            item.Referral.TeamToDisplay = item.Referral.SendingMemberArea.Name;
        }
        if(item.Referral.SendingMemberArea.Identifier === groupExternalIdentifier) {
            item.Referral.TypeToDisplay = "To";
            item.Referral.TeamToDisplay = item.Referral.ReceivingMemberArea.Name;
        }
        try {
            modifiedReferrals.push(item)            
        } catch(error) {
            console.error("Pushing handover data item failed. Error" + error);
        }
    })
    return modifiedReferrals
}

const reqReferrals = async (token, groupExternalIdentifier, skip, take) => {
    try {
        var now = moment().toISOString();
        var from = moment().subtract(config.daysForReferrals, 'days').toISOString();

        let postBody = {
            Filters: {
                Status: null,
                Created: {
                    From: null,
                    To: now
                },
                Updated: {
                    From: from,
                    To: null
                },
                ReferralDirection: "Both",
                PatientExternalIdentifiers: []
            },
            Include: [],
            Pagination: {
                Skip: skip,
                Take: take
            },
            Sorting: [
                {
                    Field: "DateCreated",
                    Order: "Descending"
                }
            ]       
          }
        const url = `${globals.urlscheme}${config.environment}${globals.appHost}/Teams/${groupExternalIdentifier}/Referrals/List`
        const headerContent = {
              'Authorization': 'Bearer ' + token,
              'Accept': 'application/json;version=10',
              'Content-Type': 'application/json;charset=UTF-8',
              'Cache-Control': 'no-cache'
            }
        let res = await axios.post(url, postBody, {headers: headerContent})
        //if(config.debug){console.log(`>> Returned ReferralList from Careflow API. Status code ${res.status}`)}

        if (res.status === 200) {                
            //if(config.debug){logJsonOutput.logToFile(`ReferralList_Team${groupExternalIdentifier}`, res.data.Data)}
            return res.data
        } else {
            console.error(`Status code: ${res.data.Messages.code}, Message: '${res.data.Messages.Message}'`)
        }
    } catch(err) {
        console.error(err)
        process.exit(1)
    }
}