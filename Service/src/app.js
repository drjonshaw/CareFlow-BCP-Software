

const setup = require('./helpers/setupFolders.js')
const getFilePaths = require('./helpers/getFilePaths.js')
const authController = require('./controllers/AuthenticationController.js')
const globals = require('./helpers/globals.js')
const teamsController = require('./controllers/TeamsController.js')
const config = require('../config.js')
const logJsonOutput = require('./helpers/logJsonOutput.js')
const reportWriter = require('./helpers/reportWriter.js')
const cleanFileName = require('./helpers/cleanFileName.js')
const handoverListController = require('./controllers/HandoverListController.js')
const tasksMetaDataController = require('./controllers/TasksMetaDataController.js')
const taskListController = require('./controllers/taskListController.js')
const referralListController = require('./controllers/ReferralListController.js')

console.log("Starting CareFlow-BCP-Software")



const Main = async function() {   
    
    // Get credentials from environment variables
    if(process.env.BCP_USERNAME && process.env.BCP_PASSWORD && process.env.BCP_NETWORKID) {
        if(config.debug) { console.log(`>> Using Environment Variables set on server`)}
    } else { 
        require('dotenv').config()
        if(process.env.BCP_USERNAME && process.env.BCP_PASSWORD && process.env.BCP_NETWORKID) {
            if(config.debug) { console.log(`>> Using Environment Variables from .env file`)}
        } else {
            console.error(`No network credentials found. 
            Set environment variables using 'BCP_USERNAME' & 'BCP_PASSWORD' & BCP_NETWORKID 
            or use .env file for local dev.`)
            return;
        }        
    }
    globals.username = process.env.BCP_USERNAME
    globals.password = process.env.BCP_PASSWORD
    globals.networkid = process.env.BCP_NETWORKID

    // Object for the report index page
    let indexReportData = {
        HeaderFields: {
            NetworkName: "",
            NetworkID: "",
            NoOfTeams: null
        },
        Teams: [],
        FilePaths: []
    }

    // Create folders etc
    if(config.outputFolder) {
        await setup.CreateFilesAndFolders(config.outputFolder)
        let filePaths = await getFilePaths.Execute()
        indexReportData.FilePaths.push.apply(indexReportData.FilePaths, filePaths)    
        if(config.debug) { logJsonOutput.logToFile("IndexFilePaths", filePaths) }
    } else { 
        console.error("No output folder set in config file.") 
    }

    // Authenticate and get token (authenticate as superuser to ensure permissions to get all teams)
    let accessToken = await authController.login()
    if(!accessToken) { 
        console.error(`Programme aborted`)
        return 
    }
   
    // Get teams and load into index report object
    if(!config.debug) {console.log(`>> getting teams and creating index files`)}
    let networkTeams = await teamsController.GetTeams(accessToken, globals.networkid)
    let networkTeamCounts = await teamsController.GetNetworkTeamCounts(accessToken, globals.networkid)
    indexReportData.HeaderFields.NetworkName = globals.networkName
    indexReportData.HeaderFields.NetworkID = globals.networkid
    indexReportData.HeaderFields.NoOfTeams = (networkTeams.Data.Groups).length        
    networkTeams.Data.Groups.forEach(function (team) {
        try {
            var cleanedTeamName = cleanFileName.Execute(team.Name) 
            team.Name = cleanedTeamName         
            team.ReportURL = team.Name + ".html"
            team.ArchiveReportURL = `${globals.archiveFileNamePrefix}_${team.Name}.html`
            // gets task and referral counts for each team
            let countObj = {}
            countObj = networkTeamCounts.Data.Groups.find(x => x.AccessGroupID === team.AccessGroupID )
            if(countObj == null ){
                team.Updates = ""
                team.OutstandingTasks = ""
                team.PendingReferralsReceived = ""
            }
            else {
                if(countObj.Updates > 0){team.Updates = countObj.Updates}
                if(countObj.OutstandingTasks > 0){team.OutstandingTasks = countObj.OutstandingTasks}
                if(countObj.PendingReferralsReceived > 0){team.PendingReferralsReceived = countObj.PendingReferralsReceived}
            }       
            indexReportData.Teams.push(team)
        } catch(error) {
            console.error(`Pushing team data into Index report object failed for ${team.Name} ${team.AccessGroupID}. Error ${error}`);
        }
    })
    if(config.debug) {
        logJsonOutput.logToFile("IndexData", indexReportData)
    }

    // Create index.html page in the folder called 'latest'
    let indexFileDetails = {
        type: 'index', 
        template: `${globals.resourceFolder}/${globals.indexTemplate}`,
        filePathToCreate: `${globals.latestFolderName}/${globals.indexFileName}.html`
    }
    reportWriter.TransformAndWriteReport(indexFileDetails, JSON.stringify(indexReportData), ("network " + globals.networkName));
    
    let archiveIndexFileDetails = {
        type: 'archiveIndex', 
        template: `${globals.resourceFolder}/${globals.indexTemplate}`,
        filePathToCreate: `${globals.archiveFolderName}/${globals.indexFileName}_${globals.archiveFileNamePrefix}.html`
    }
    reportWriter.TransformAndWriteReport(archiveIndexFileDetails, JSON.stringify(indexReportData), ("network " + globals.networkName));
    globals.groupsAllowingTasks


    // Create array of teams that have tasks enabled
    if(globals.taskPermissions){
        let taskTeams = await tasksMetaDataController.GetTasksMetaData(accessToken, globals.networkid)
        try {
            globals.groupsAllowingTasks.push.apply(globals.groupsAllowingTasks, taskTeams.Data.GroupsAllowingTasks)
            logJsonOutput.logToFile("TaskTeams", globals.groupsAllowingTasks)
        } catch(error) {
            console.error("Pushing task meta data into globals failed. Error" + error);
        }
    }
    
    // loop through data set and call importer functions for report
    if(!config.debug) {console.log(`>> getting team lists and creating reports...`)}
    var thisReportObject = {}
    var arrayLength = (indexReportData.Teams).length;
    for (var i = 0; i < arrayLength; i++) {
        var team = indexReportData.Teams[i];
        // create object for parameters
        thisReportObject = {
            ReportFields: {
                "TeamName": team.Name,
                "TeamID": team.MemberAreaID,
                "AccessGroupID": team.AccessGroupID,
                "GroupExternalIdentifier": team.GroupExternalIdentifier,
                "NoOfPatients": 0,
                "DaysForTasks": config.daysForTasks,
                "DaysForReferrals": config.daysForReferrals,
                "HasTasksEnabled": false                
            },
            Patients: [],
            Tasks: [],
            Referrals: []
        }

        // get patient list and handover notes for this team, set fields and push into report object
        let patientArray = await handoverListController.GetHandovers(accessToken, team.MemberAreaID)
        thisReportObject.ReportFields.NoOfPatients = patientArray.length
        thisReportObject.Patients.push.apply(thisReportObject.Patients, patientArray)

        // now get task data for this team, set fields and push into report object
        if(globals.taskPermissions){
            if (!!globals.groupsAllowingTasks.find(x=> x.AccessGroupId === team.AccessGroupID)) {
                let taskArray = await taskListController.GetTasks(accessToken, team.AccessGroupID)
                thisReportObject.Tasks.push.apply(thisReportObject.Tasks, taskArray)
                thisReportObject.ReportFields.HasTasksEnabled = true
            }
        }

        // now get referrals for this team, set fields and push into report object
        if(globals.referralPermissions){
            let referralsArray = await referralListController.GetReferrals(accessToken, team.GroupExternalIdentifier)
            thisReportObject.Referrals.push.apply(thisReportObject.Referrals, referralsArray)
        }

        // log json output
        if(config.debug) {
            logJsonOutput.logToFile(`TeamReport_${i}`, thisReportObject)
        }

        /// create report and write it into 'latest' folder
        let latestFileDetails = {
            type: 'teamReport', 
            template: `${globals.resourceFolder}/${globals.handoverTemplate}`,
            filePathToCreate: `${globals.latestFolderName}/${team.Name}.html`
        }
        reportWriter.TransformAndWriteReport(latestFileDetails, JSON.stringify(thisReportObject), thisReportObject.ReportFields.TeamName)

        /// create a copy of the report and write it into the current 'archive' folder
        let archiveIndexFileDetails = {
            type: 'archiveTeamReport', 
            template: `${globals.resourceFolder}/${globals.handoverTemplate}`,
            filePathToCreate: `${globals.archiveFolderName}/${globals.archiveFileNamePrefix}_${team.Name}.html`
        }
        reportWriter.TransformAndWriteReport(archiveIndexFileDetails, JSON.stringify(thisReportObject), thisReportObject.ReportFields.TeamName)

        // end of loop
        if (i == (arrayLength-1) && config.debug) {
            console.log(`>> ${arrayLength} team(s) imported and reports generated.`);
        }
    }
    
    console.log(`\n**End of program run for CareFlow-BCP-Solution**`)
}



Main();