const axios = require('axios')
const qs = require('querystring')
const config = require('../../config.js')
const globals = require('../helpers/globals.js')
const logJsonOutput = require('../helpers/logJsonOutput.js')

// axios https://flaviocopes.com/node-axios/

module.exports = {
    async login (req, res) {
        try {
            const url = `${globals.urlscheme}${config.environment}${globals.authHost}/Home/Login`
            const headerContent = { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache','API-Key': 'FF99FF99-FF99-FF99-FF99-FF99FF99FF99' }
            const data = qs.stringify({
                response_type: 'token',
                redirect_uri: 'http://www.careflowconnect.com',
                client_id: 'DocComMobile',
                emailAddress: globals.username,
                password: globals.password
                })
            let response = await axios.post(url, data, {headers: headerContent})
            console.log(`>> Auth request status code = ${response.status}`)

            if (response.status === 200 ) {          
                const user = await GetUser(response.headers.access_token)
                if (user.status === 200) {
                    if(config.debug) {
                        console.log(`>> Logged in as ${user.data.Data.FullName.FirstName} ${user.data.Data.FullName.LastName}`)
                    }
                    let memberAreaObj = user.data.Data.MemberAreasAndPermissions.find(o => o.NetworkId === parseInt(globals.networkid))
                    //if(config.debug) {logJsonOutput.logToFile("UserData", user.data) }

                    if(memberAreaObj){
                        globals.networkName = memberAreaObj.NetworkName                        
                    } else {
                        console.error(`User ${user.data.Data.FullName.FirstName} ${user.data.Data.FullName.LastName} is not a member of NetworkID ${globals.networkid} or 'networkid' not set in config file`)
                        return;
                    }
                } 

                return response.headers.access_token;             
            }                
        } catch (err) {
            console.error(`Auth failed!`);
            console.error(`Response status ${err.response.status}`);
        }
    }
}



const GetUser = async (token) => {
    try {
      const url = `${globals.urlscheme}${config.environment}${globals.appHost}/Users/GetRequestingUserSummary?includeInferredPermissions=true`
      const headerConfig = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json;version=10',
          'Content-Type': 'application/json;charset=UTF-8',
          'Cache-Control': 'no-cache'
        }
      } 
      let userResponse = await axios.get(url, headerConfig)
      //console.log(`Returned UserSummary from Careflow API. Status code ${userResponse.status}`);
      return userResponse;
    } catch (err) {
      console.log(`Error occured authenticating.`)
      console.error(err.response)
    }
};