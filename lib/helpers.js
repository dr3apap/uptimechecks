/*** 
 * Helpers for various tasks 
 * 
*/

// Dependencies
//require("dotenv").config();
const crypto = require('crypto');
const config = require('./config');
const queryString = require('querystring');
const https = require('https');// Container for helpers
const fs = require('fs');
const path = require('path');
require("dotenv").config();

const helpers = {};

// Parse a JSON string to a object in all cases, wigthout throwing
helpers.parseJsonToObj = function(str){
    try{
        const obj = JSON.parse(str);
        return obj;

    } catch(e){
            return {}
    }
}

// Create a SHA256 hash
helpers.hash = function(str){
    if(typeof(str) === 'string' && str.length > 0){
    const hash = crypto.createHmac('sha256', process.env.DEVELOPMENT_HASH_SECRET).update(str).digest('hex');
    return hash;
    } else{
        return false;
    }
};

helpers.checkUser = function(phone, password){
let phoneNum = phone.trim().length == 10?phone:false;
let pass = password.trim().length >= 10?password:false;
return {
    "phone":phoneNum,
    "password":pass
}
}
helpers.validatePassword = function(password){

}

helpers.randomStr = function(strLen){
    strLen = typeof(strLen) == "number" && strLen  > 0?strLen:false;
    if(strLen){
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var randomStr = "";
    for(i = 0; i < strLen; i++){
    randomStr+=letters.charAt(Math.floor(Math.random() * letters.length));
    } 
  } else {
        return false;
    }

    return randomStr;
}
//TODO: Helper to verify password and also input data, has to be generic 
// receive a data object and keys to fields return ture if all keys present and has same shape/quantity
helpers.twilioSms = function(phone, msg, callback){
    phone = typeof(phone) == "string" && phone.trim().length == 10?phone.trim():false;
    msg = typeof(msg) == "string" && msg.trim().length > 0 && msg.trim().length <= 1600?msg.trim():false;
    if(phone && msg){
        const payload = {
            From:process.env.FROMPHONE,
            To:`+1${phone}`,
            Body:msg
        };
        const payloadString = queryString.stringify(payload);
        const reqPayload = {
            protocol:"https:",
            hostname:"api.twilio.com",
            method:"POST",
            path:`/2010-04-01/Accounts/${process.env.ACCOUNTSID}/Messages.json`,
            auth:`${process.env.ACCOUNTSID}:${process.env.AUTHTOKEN}`,
            headers:{
                "Content-Type":"application/x-www-form-urlencoded",
                "Content-Length":Buffer.byteLength(payloadString),
            },

        };
        const req = https.request(reqPayload, (res) => {
            const reqStatus = res.statusCode;
            if(reqStatus == 200 || reqStatus == 201){
                callback(false);
            } else {
                callback(`Status code returned ${reqStatus}`);
            }
        });
        req.on("error", (err) => {
            callback(err);
        });
        req.write(payloadString);
        req.end();
    } else {
        callback("Missing required parameter(s) or parameter are invalid");
    }
};

helpers.getTemplate = function(templateName, data, callback){
    templateName = typeof(templateName) == "string" && templateName.length > 0?templateName:false;
    data = typeof(data) == "object" && data !== null?data:{};
    if(templateName){
        const  templatesDir = path.join(__dirname, "/../templates/");        
        fs.readFile(`${templatesDir}${templateName}.html`,"utf8", (err, templateString) => {
            if(!err && templateString){
                const finalTemplate = helpers.interpolate(templateString, data);
               callback(false, finalTemplate, "html"); 
            } else {
                callback("error:No template found!");
            }
        });
    } else {
        callback("error:A valid template name was not specified!");
    }
};


helpers.addUniversalTemplate = (str, data, callback) => {
    data = typeof(data) == "object" && data !== null?data:{};
    str = typeof(str) == "string" && str.length > 0?str:"";
    helpers.getTemplate("_header", data, (err, header) => {
        if(!err && header){
            helpers.getTemplate("_footer", data, (err, footer) => {
                if(!err && footer){
                    const fullTemplate = `${header}${str}${footer}`;
                    callback(false, fullTemplate);

                } else {
                    callback("error:Couldn't get footer template")
                }
            });

        } else{
            callback("error:Couldn't get heaeder template")
        }
    });
    




};



helpers.interpolate = (str, data) => {
//validate parameter
str = typeof(str) == "string" && str.length > 0?str:"";
data = typeof(data) == "object" && data !== null?data:{};
// take a string and an data obj iterate through a global obj and 
// copy the global obj to the data obj with key prefix with the str 'global'
for(const keyName in config.templateGlobals){
    if(config.templateGlobals.hasOwnProperty(keyName)){
        data[`global.${keyName}`] =  config.templateGlobals[keyName];
    }
};
   // replace anything that start with "{" and end with "}"
   // the value from the data obj
   for(const key in data){
    if(data.hasOwnProperty(key)){
        let find = `{${key}}`//RegExp(`^\\{${key}\\}$`);
        str = str.replace(find, data[key]);
    };
   };
   return str;
}

helpers.getStaticAssets = (fileName, callback) => {
    fileName = typeof(fileName) == "string" && fileName.length > 0?fileName:false;
    if(fileName){
    const publicDir = path.join(__dirname, "/../public/");
    fs.readFile(`${publicDir}${fileName}`, (err, staticData) => {
        if(!err && staticData){
            callback(false, staticData);
        } else {
            callback("error:Couldn't find specified file!");
        }
    });
} else {
    callback("error:A valid name was not specified!");
}

}

module.exports = helpers;