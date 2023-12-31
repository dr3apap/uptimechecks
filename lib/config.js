/**
*Create and export enviroment configuration variables, they are CONSTANT Variables putting them in one container
allow easy refactoring or adding new features
*/

// Dependencies 
require('dotenv').config();
// Container for all enviroment
const enviroments = {};

// Staging default enviroment
enviroments.staging = {
    envName:"staging",
    httpPort:process.env.DEVELOPMENT_HTTP_PORT,
    httpsPort:process.env.DEVELOPMENT_HTTPS_PORT,
    hashSecret:process.env.DEVELOPMENT_HASH_SECRET,
    maxChecks:process.env.MAX_CHECKS,
    templateGlobals:{
    appName:"UptimeChecker",
    companyName:"JustTesting, Inc",
    yearCreated:"2023",
    baseUrl:`http://localhost:${process.env.DEVELOPMENT_HTTP_PORT}/`
   } 
   
};

// Production enviroment
enviroments.production = {
    envName:"production",
    httpPort:process.env.PRODUCTION_HTTP_PORT,
    httpsPort:process.env.PRODUCTION_HTTPS_PORT,
    hashSecret:process.env.PRODUCTION_HASH_SECRET,
    maxChecks:process.env.MAX_CHECKS,
    templateGlobals:{
    appName:"Uptimechecker",
    companyName:"JustTesting, Inc",
    yearCreated:"2023",
    baseUrl:`http://localhost:${process.env.PRODUCTION_HTTPS_PORT}/`
   }
}

// Determine which  enviroment was passed in as command line
// argument 
const currentEnviroment = typeof(process.env.NODE_ENV) ===
'string'?process.env.NODE_ENV.toLowerCase():"";

// Checking if the current enviroment is one of the above, if not default to
// staging 
let env;
const enviromentToexport = typeof((env = enviroments[currentEnviroment])) ==
"object"?env:enviroments.staging;

module.exports = enviromentToexport;
