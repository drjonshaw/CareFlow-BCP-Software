// set debug: true to generate json log files and console logs
// set environment to "appdev" for development and leave as an empty string for live/customer QA

module.exports = {
    debug: true,
    environment: "appdev",
    outputFolder: "../output",
    archivingIntervalInHours: 6,
    daysForTasks: 31,
    daysForReferrals: 14,
    notify_clientId: "",
    notify_alertTopicId: ""
}