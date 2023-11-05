/**
 * CLI-Related Tasks/Jobs 
 */

// Dependencies
const readline = require("readline");
const util = require('util');
const events = require('events');
const os = require('os');
const _data = require('./data');
const _logs = require('./logs');
const _helpers = require('./helpers');
class _events extends events{};
const e = new _events();
const debug = util.debuglog('cli');
const v8 = require('v8');

// Instantiate the CLI container/module object
const cli = {};



e.on('man', function(str){
    cli.processInput.help();

})

e.on('help', function(str){
    cli.processInput.help();

})

e.on('exit', function(str){
    cli.processInput.exit();

})

e.on('stats', function(str){
    cli.processInput.stats();

})

e.on('list users', function(str){
    cli.processInput.listUsers();

})

e.on('user details', function(str){
    cli.processInput.userDetails(str);

})

e.on('list checks', function(str){
    cli.processInput.listChecks(str);

})


e.on('check details', function(str){
    cli.processInput.checkDetails(str);

})


e.on('list logs', function(){
cli.processInput.listLogs();
})

e.on('logs details', function(str){
    cli.processInput.logDetails(str);

})


// input responders
cli.processInput = {};
// Help/Man


cli._printResponseToConsole = function(data, headerString, vSpace = 2){
    
    // Set of functions to format the help/man page to the console
        cli.horizontalLine();
        cli.centered(headerString);
        cli.horizontalLine();
        //cli.verticalSpace(vSpace);
        
        // Show each command to users, followed by the descriptions, in white and yellow respectively

        for(const key in data){
            if(data.hasOwnProperty(key)){
                let value = data[key];
                let line = `\x1b[33m${key}\x1b[0m`;
                let padding = 60 - line.length; 
                for(let i = 0; i<padding; i++){
                    line+=' ';
                }
                line+=value;
                console.log(`${line}\n\n`);
                //console.log("\n");
            }
        }
        console.log("\n\n");
        //console.log("\n");

        // end with another horizontal line
        cli.horizontalLine();
};

// compute a vertical space
cli.verticalSpace = function(numOfLines){
    numOfLines = typeof(numOfLines) == 'number' && numOfLines > 0?numOfLines:1;
    for(let i = 0; i< numOfLines; i++){
        console.log("\n");
    }

}
cli.processInput.help = function(){

   const commands = {
            'exit':"Terminate the CLI (and the rest of the application",
            'man':"Show this help page", 
            'help':"Alias to the 'man' command",
            'stats':"Show statistics on the underlying operating system and resource utilization",
            'list users':"Show the list of all the registered (undeleted) users in the data base",
            'user details --{userId}':"Show details of a specific user",
            'list checks --up --down':"Show the list of all active checks in the data base, including their state. The '--up' and '--down' flags are optional",
            'check details --{checkId}':"Show details of a specified check",
            'list logs':"Show the list of all log files avaialble (compressed and uncompressed)",
            'logs details --{logsFileName}':"Show details of a specified log file"

        };
        cli._printResponseToConsole(commands,"~~~ CLI MANUAL ~~~");

        };

cli.horizontalLine = function(){
    // Get the available window/console viewport
    const consoleWidth = process.stdout.columns;
    let line = '';
    for(let i = 0; i<consoleWidth;i++){
        line+="-";
    };
    console.log(line);
}
cli.centered = function(strToCenter){
    // check input
    strToCenter = typeof(strToCenter) == "string" && strToCenter.trim().length > 0? strToCenter.trim():'';
     // Get the available window/console viewport
    const strOffset = Math.floor((process.stdout.columns - strToCenter.length) / 2);
    let line = '';
    for(let i = 0; i<strOffset; i++){
        line+=" ";
    }
    line+=strToCenter;
    console.log(line);
}

// Exit
cli.processInput.exit = function(){
    process.exit(0);
}

// Stats
cli.processInput.stats = function(){
    // encode a stats object
    const stats = {
        "Load Average":os.loadavg().join(" "),
        "CPU Count":os.cpus().length,
        "Free Memory":os.freemem(),
        "Current Malloced Memory":v8.getHeapStatistics().malloced_memory,
        "Peak Malloced Memory":v8.getHeapStatistics().peak_malloced_memory,
        "Allocated Heap Used (%)":Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
        "Available Heap Allocated (%)":Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
        "Uptime":`${os.uptime} seconds`
    };
    cli._printResponseToConsole(stats, "~~~ System Stats ~~~");

}

// List users
cli.processInput.listUsers = function(){
   // get the list of users id
    _data.listDir("users", (err, userIds) => {
        if(!err && userIds && userIds.length > 0){
            cli.verticalSpace();
            // Use the usersId to get each users info
            userIds.forEach((userId) => {
                _data.read("users", userId, (err, userData) => {
                    if(!err && userData){
                    // form a line with the user data
                    let line = `Name: ${userData.firstName} ${userData.lastName} Phone: ${userData.phone} checks: `;
                    let numberOfChecks = typeof(userData.checks) == "object" && userData.checks instanceof Array && userData.checks.length > 0?userData.checks.length:0;
                    line+=numberOfChecks;
                    console.log(line);
                    cli.verticalSpace();

                    }
                });
            });
        }     
    });
     
};

// User details 
cli.processInput.userDetails = function(str){
        // parse the switch options by user
        const inputOption = str.split("--");
        const userId = typeof(inputOption[1]) == "string" && inputOption[1].trim().length > 0?inputOption[1].trim():false;
        if(userId){
            // Use the usersId to get each user info
                _data.read("users", userId, (err, userData) => {
                    if(!err && userData){
                        // remove the hasshedPassword
                        delete userData.hashedPassword;
                        // print the JSON format of the userInfo
                        cli.verticalSpace();
                    console.dir(userData, {colors:true});
                    cli.verticalSpace();

                    };
                });
        };     
};
    



// List checks
cli.processInput.listChecks = function(str){
    // parse the switch option by user
    var inputOption = str.split("--");
    inputOption = typeof(inputOption[1]) == "string" && inputOption[1].trim().length > 0?inputOption[1].trim():false;
    var line;
    // Get the list of checkId
        _data.listDir("checks", (err, checkIds) => {
            if(!err && checkIds.length > 0){
                cli.verticalSpace();
                checkIds.forEach((checkId) => {
                    _data.read("checks", checkId, (err, checkData) => {
                        if(!err && checkData){
                            let checkToInclude = false;
                            let lowerInputOption = str.toLowerCase();
                        // Grab the state or default to down
                        let state = typeof(checkData.state) == "string"?checkData.state:"down";
                        // Grab the state or default to unknown
                        let stateOrUnknown = typeof(checkData.state) == "string" ?checkData.state:"unknown";
                        // If the user choose an option or didn't,  inlcude the current check accordingly
                        if(lowerInputOption.includes(`--${state}`) || (!lowerInputOption.includes("--up") && !lowerInputOption.includes("--down") )){
                            line = `Id: ${checkData.id} Method: ${checkData.method.toUpperCase()} Protocol: ://${checkData.protocol} Url: ${checkData.url} State: ${stateOrUnknown}`;
                            console.log(line);
                            cli.verticalSpace();
                        } 
                    };
            });
        });

    };
});
};


// check details
cli.processInput.checkDetails = function(str){
    // parse the user input for options
    const inputOption = str.split("--");
    // validate input
    const checkId = typeof(inputOption[1]) == "string" && inputOption[1].trim().length > 0?inputOption[1].trim():false;
    if(checkId){
        _data.read("checks", checkId, (err, checkData) => {
            if(!err && checkData){
                console.dir(checkData, {colors:true});
            }
        });
    }
}

// List logs
cli.processInput.listLogs = function(){
    // Get the list of logs files
    _logs.listLogs(true, (err, logFileNames) => {
        if(!err && logFileNames.length > 0){
            cli.verticalSpace();
            logFileNames.forEach((fileName) => {
            let line = /-\w+/.test(fileName)?`CheckLogsFileName: ${fileName.replace(/-\w+$/, "")}`:"";
            if(line.length > 0){
                console.log(line);
            cli.verticalSpace();
            }
            });
        };
    });
}

// Log details
cli.processInput.logDetails = function(str){
    // parse the input option by user
    const inputOption = str.split("--");
    // validate the input option
    const logId = typeof(inputOption[1]) == "string" && inputOption.length > 0?inputOption[1].trim():false;
    if(logId){
        _logs.listLogs(true, (err, logFileNames) => {
            if(!err && logFileNames.length > 0){
                logFileNames.forEach((fileName) => {
                let compressedLogs = fileName.replace(/-\w+/, "") == logId? fileName:false;
                if(compressedLogs){
                    _logs.decompress(compressedLogs, (err, logsData) => {
                        if(!err && logsData){
                         logsData.split("\n").forEach((log) => {
                            console.dir(_helpers.parseJsonToObj(log), {colors:true});
                            cli.verticalSpace();
                         });
                        };
                    });
                }

                });
            }
        });
    }
}


// Input handler
cli.inputHandler = function(str){
    str = typeof(str) == 'string' && str.trim().length > 0? str:false;
    // Only handle the input if the user actually wrote something. Otherwise ignore it
    if(str){
        // List of  unique input map to response handlers
        const uniqueInputs = [
            'man', 
            'help',
            'exit',
            'stats',
            'list users',
            'user details',
            'list checks',
            'check details',
            'list logs',
            'logs details'

        ];
        // Match the input to the uniquelist if matched ? emit a matched/found event
        var matchInput = false;
        var counter = 0;
        uniqueInputs.some((input) => {
            if(str.toLowerCase().includes(input)){
                matchInput = true;
                // Emit an event matching the unique input with the full string inputed by the user
                e.emit(input, str);
                return true;
            }
        });
        if(!matchInput) console.log("Sorry, try again");
    }

};

// Init function
cli.init = function(){
    // Start the program with a dark blue message
    console.log('\x1b[34m%s\x1b[0m', "The CLI is running\n");
    // start the interface
    const _interface = readline.createInterface({
        input:process.stdin,
        output:process.stdout,
        prompt: "> "
    });
    // Start the initial prompt
    _interface.prompt();

    // Hook to the events and handle each input seprately
    _interface.on('line', function(str){
        // pass the str to the input handler
        cli.inputHandler(str);
        // Re-initialize the prompt again cus it's a singleton
        _interface.prompt();
    });

    // If the user exit/interupt the CLI, kill the associcated process 
    _interface.on('close', function(){
        process.exit(0);        
    });

}


// Export the container/module
module.exports = cli;
