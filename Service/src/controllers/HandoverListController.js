const axios = require('axios')
const underscore = require('underscore')
const moment = require('moment')
const config = require('../../config.js')
const globals = require('../helpers/globals.js')
const logJsonOutput = require('../helpers/logJsonOutput.js')
const itemsPerPage = 100

module.exports = {
    async GetHandovers (token, memberAreaID) {
        try {
            let patients = []
            let page = 0
            let thereAreMore = true
            while(thereAreMore) {
                let res = await reqHandovers(token, memberAreaID, page)
                await patients.push.apply(patients, res.Data)
                page++
                if(!res.Metadata.Pagination.ThereAreMore) {
                    thereAreMore = false;                    
                    let returnedPatients = await modifyHandoverData(patients)
                    //if(config.debug){logJsonOutput.logToFile(`HandoverPatientList_Team${memberAreaID}`, returnedPatients)}
                    return returnedPatients
                }
            }            
        } catch(err) {
            console.error(err)
            process.exit(1)
        }
    }
}

// function for modifying parts of the data for the UI to use
const modifyHandoverData = async(patients) => {
    let modifiedPatients = []
    patients.forEach((patient) => {
        patient.TheLocation = (patient.SiteName ? patient.SiteName : "") + "___" + (patient.AreaName ? patient.AreaName : "");
        patient.HasFullLocationType = !!(patient.SiteName && patient.AreaName);
        patient.HasLocation = !!(patient.SiteName || patient.AreaName);
        if (patient.HandoverNotes && patient.HandoverNotes.length) {
            //Sort by SBAR keys
            patient.HandoverNotes[0].Notes = underscore.sortBy(patient.HandoverNotes[0].Notes, function (item) { return item.Position; });
        }
        try {
            modifiedPatients.push(patient)            
        } catch(error) {
            console.error("Pushing handover data item failed. Error" + error);
        }
    })
    return modifiedPatients
}

// axios request
const reqHandovers = async (token, memberAreaID, page) => {
    try {
        let postBody = {
            ClinicalTags: [],
            Clinicians: [],
            Include: ["ClinicalTags", "JustCurrentGroupClinicalTags", "HandoverNotes"],
            ItemsPerPage: itemsPerPage,
            Locations: [],
            Page: page,
            SortBy: "PatientName",
            SortDirection: "Ascending"
          }
        const url = `${globals.urlscheme}${config.environment}${globals.appHost}/Groups/${memberAreaID}/Patients`
        const headerContent = {
              'Authorization': 'Bearer ' + token,
              'Accept': 'application/json;version=10',
              'Content-Type': 'application/json;charset=UTF-8',
              'Cache-Control': 'no-cache',
              'API-Key': 'FF99FF99-FF99-FF99-FF99-FF99FF99FF99'
            }
        let res = await axios.post(url, postBody, {headers: headerContent})
        //if(config.debug){console.log(`\n>> Returned PatientList from Careflow API. Status code ${res.status}`)}

        if (res.status === 200) {                
            //if(config.debug){logJsonOutput.logToFile(`HandoverList_Team${memberAreaID}`, res.data.Data)}
            return res.data
        } else {
            console.error(`Status code: ${res.data.Messages.code}, Message: '${res.data.Messages.Message}'`)
        }
    } catch(err) {
        console.error(err)
        process.exit(1)
    }
}