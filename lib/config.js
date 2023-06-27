/**
*Create and export enviroment configuration variables
*/

// Dependencies 
// Container for all enviroment
const enviroments = {};

// Staging default enviroment
enviroments.staging = {
    envName:"staging",
    httpPort:3000,
    httpsPort:3001,
    hashSecret:process.env.DEVELOPMENT_HASH_SECRET,
    maxChecks:5,
    templateGlobals:{
    appName:"Uptimechecker",
    companyName:"JustTesting, Inc",
    yearCreated:"2018",
    baseUrl:"http://localhost:3000/"
   } 
   
};

// Production enviroment
enviroments.production = {
    envName:"production",
    httpPort:5000,
    httpsPort:50001,
    hashSecret:process.env.PRODUCTION_HASH_SECRET,
    maxChecks:5,
    templateGlobals:{
    appName:"Uptimechecker",
    companyName:"JustTesting, Inc",
    yearCreated:"2018",
    baseUrl:"http://localhost:5000/"
   }
}

// Determine which enviroment which enviroment was passed in as command line
// argument 
const currentEnviroment = typeof(process.env.NODE_ENV) ===
'string'?process.env.NODE_ENV.toLowerCase():"";

// Checking if the current enviroment is one of the above,if not default to
// staging 
const enviromentToexport = typeof(enviroments[currentEnviroment]) ===
"object"?enviroments[currentEnviroment]:enviroments.staging;

module.exports = enviromentToexport;
