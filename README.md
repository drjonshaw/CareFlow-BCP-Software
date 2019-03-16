# CareFlow-BCP-Solution
Business Continuity Solution for CareFlow Connect
by Jon Shaw, March 2019

**About**
- This is a node.js application for pulling data from CareFlow Connect for a given client network
- Original application created in 2018 refactored and updated to use new endpoints and include handover profiles

**Notes**
- This application requires network credentials of 'Super user' role in order to ensure the application can access all teams and all team content 
- To find your NetworkID, log into CareFlow Connect and go to your network home page. The ID can be found in the url segment.


**Getting Started**

1. Pull solution into local folder on server / azure app service / local machine1. 

2. In the command prompt change into the 'Service' directory within that root folder and install all dependencies using
   $ npm install

3. Add the credentials and networkid as Environmental Variables
    - locally via .env file in the root folder (see docs folder for example)
    - directly in windows or azure app service

4. Set parameters in the config.js file (note only use quotations for strings as this is a javascript object, not Json). Example:
    debug: false,
    environment: "",
    outputFolder: "../output",
    archivingIntervalInHours: 6,
    daysForTasks: 30,
    daysForReferrals: 14,
    notify_clientId: "",
    notify_alertTopicId: ""

5. Setting 'debug: true' will output more to the console log and create json files to examine the data

5. To run solution using npm, cd into 'Service' directory, then
    $ npm start