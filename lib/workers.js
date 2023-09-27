const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');
const fs = require('fs');
const _data = require("./data");
const _helpers = require('./helpers');
const _logs = require('./logs');

const workers = {};
workers.init = function(){
workers.getAllChecks();
workers.loop();
workers.dayLogsJournal();
workers.dayLogsJournalLoop();

}


// Execute all the checks immidiately
workers.getAllChecks = function(){
   _data.listDir("checks", (err, checks) => {
    if(!err && checks.length > 0){
        checks.forEach(check => {
        _data.read("checks", check, (err, initialCheck) => {
            if(!err && initialCheck){
                workers.validateCheck(initialCheck);

            }else{
                //console.log("Error Couldn't read one of the checks");
            }
        });
        });


    } else {
        //console.log("Error: Couldn't find any check to process");
    }

   });

}

workers.validateCheck = function(initialCheck){
        initialCheck = typeof(initialCheck) == 'object' && initialCheck != null?initialCheck:{};
        let protocol = initialCheck?.protocol;
        let url = initialCheck?.url;
        let method = initialCheck?.method;
        let successCodes = initialCheck?.successCodes;
        let timeout = initialCheck?.timeout;
        let id = initialCheck?.id;
        let phone = initialCheck?.phone;
        let lastChecked = initialCheck?.lastChecked || "";
        let state = initialCheck?.state || "";
       
        protocol = typeof(protocol) == "string" && ["https", "http"].includes(protocol)?protocol:false;
        url = typeof(url) == "string" && url.trim().length > 0?url:false;
        method = typeof(method) == "string" && ["get", "post", "put", "delete"].includes(method)?method:false;
        successCodes = typeof(successCodes) == "object" && successCodes instanceof Array && successCodes.length > 0?successCodes:false
        timeout = typeof(timeout) == "number" && timeout % 1 === 0 && timeout >= 1 <= 5?timeout:false;
        state = typeof(state) == "string" && ["up", "down"].includes(state)?state:"unknown"; 
        lastChecked = typeof(lastChecked) == "number" && lastChecked > 0?lastChecked:false;
        phone = typeof(phone) == "string" && phone.trim().length == 10?phone:false;
        id = typeof(id) == "string" && id.trim().length == 20?id:false;
        
        if(protocol && url && method && successCodes && timeout && phone && id){
            const updatedCheck = {
            id,
            phone,
            protocol,
            method, 
            url,
            successCodes, 
            timeout, 
            state, 
            lastChecked,
            }
            workers.performCheck(updatedCheck);

        } else {
            ////console.log("Erro:Couldn't validate one of the initial check fields/property. Skipping it");
        }
};

workers.processCheckOutcome = (updatedCheck, checkOutCome) => {
    const checkTime = Date.now()
    updatedCheck.lastChecked = checkTime;
    const currentState = !checkOutCome.error && checkOutCome.responseCode && updatedCheck.successCodes.includes(checkOutCome.responseCode)? "up":"down";
    const canAlert = updatedCheck.lastChecked && currentState !== updatedCheck.state?true:false;
    workers.log(updatedCheck, checkOutCome, currentState, canAlert, checkTime);

    const newUpdatedCheck = updatedCheck;
    newUpdatedCheck.state = currentState;
    _data.update("checks",updatedCheck.id, newUpdatedCheck,(err) => {
    if(!err){
     if(canAlert){
        workers.alertStatusChange(newUpdatedCheck); 
 } else {
    //console.log("Check outcome has not changed, no alert needed!");
 }
    } else {
        //console.log("Error:Couldn't update one of the checks");
    }
 });
 
};

workers.performCheck = (updatedCheck) => {
        const parsedUrl = url.parse(`${updatedCheck.protocol}://${updatedCheck.url}`, true);
        const hostname = parsedUrl.hostname;
        const path = parsedUrl.path;
        const reqPayload = {
            protocol:`${updatedCheck.protocol}:`,
            method:updatedCheck.method.toUpperCase(),
            hostname,
            path,
            timeout:updatedCheck.timeout * 1000
        }
            const checkOutCome = {
                error:false,
                responseCode:false
            };
            let outcomeSent = false;

            const _moduleToUse = updatedCheck.protocol == "http"?http:https;

            const req = _moduleToUse.request(reqPayload, (res) => {
                const statusCode = res.statusCode;
                checkOutCome.responseCode = statusCode;
                if(!outcomeSent){
                    workers.processCheckOutcome(updatedCheck, checkOutCome);
                    outcomeSent = true;
                }
               

            });
            req.on("error", (err) => {
                checkOutCome.error = {
                    error:true,
                    value:err
                }
                if(!outcomeSent){
                    workers.processCheckOutcome(updatedCheck, checkOutCome);
                    outcomeSent = true;
                }

            });
            req.on("timeout", (err) => {
                checkOutCome.error = {
                    error:true,
                    value:"timeout"
                }
                if(!outcomeSent){
                workers.processCheckOutcome(updatedCheck, checkOutCome);
                outcomeSent = true;
                }

            });
            req.end();
        
    };

workers.alertStatusChange = (newUpdatedCheck) => {
      const phone = newUpdatedCheck.phone;
      const msg = `Alert:Your check for (${newUpdatedCheck.method.toUpperCase()}) (${newUpdatedCheck.protocol}://${newUpdatedCheck.url} is currently ${newUpdatedCheck.state})`;
     _helpers.twilioSms(phone, msg, (err) => {
        if(!err){
           //console.log("Success: ", msg);
        } else {
            //console.log("Error:Couldn't send alert!");
        }
    });

    };

workers.log = function(initialCheck, checkOutCome, state, canAlert, checkTime){
    const logData = {
        check:initialCheck,
        outcome:checkOutCome,
        state,
        alert:canAlert,
        time:checkTime
    };
    const logDataToString = JSON.stringify(logData);

    const logFileName = initialCheck.id;
    _logs.append(logFileName, logDataToString, (err) => {
        if(!err){
            //console.log(`Logging to ${logFileName} file Succeeded!`);
        } else {
            //console.log(`Logging to ${logFileName} failed!`);
        }
    });

};
workers.dayLogsJournal = () => {
    _logs.listLogs(false, (err, listOfLOgs) => {
        if(!err && listOfLOgs.length > 0){
         listOfLOgs.forEach((log) => {
            _logs.compresseLogs(log, `${log}-${Date.now()}`, (err) => {
                if(!err){
                    _logs.truncate(log, (err) => {
                      if(!err) {
                        //console.log(`Success:log with log id ${log} was compressed and the original log truncated and ready to receive new logs for the day`)
                      } else {
                        //console.log(err);
                      }
                    });
                } else {
                    //console.log(err);
                }

            });
         })
        } else {
            //console.log(err)
        }

    });

};


workers.loop = function(){
    setInterval(workers.getAllChecks, 1000 * 60);
}
workers.dayLogsJournalLoop = function(){
  setInterval(workers.dayLogsJournal, 1000 * 60 * 60 * 24);
}





module.exports = workers;