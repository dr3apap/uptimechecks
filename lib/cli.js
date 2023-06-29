/**
 * CLI-Related Tasks/Jobs 
 */

// Dependencies
const readline = require("readline");
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
class _events extends events{};
const e = new _events();

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


e.on('checks details', function(str){
    cli.processInput.checkDetails(str);

})


e.on('list logs', function(str){
    cli.processInput.listLogs();

})

e.on('logs details', function(str){
    cli.processInput.logDetails(str);

})


// input responders
cli.processInput = {};
// Help/Man
cli.processInput.help = function(){
    console.log("Responding to help");
}
// Exit
cli.processInput.exit = function(){
    process.exit(0);
}

// Stats
cli.processInput.stats = function(){
    console.log("Responding to stats");
}

// List users
cli.processInput.listUsers = function(){
    console.log("Responding to list users");
}

// User details 
cli.processInput.userDetails = function(str){
    console.log("Responding to users details for user: ", str);
}

// List checks
cli.processInput.listChecks = function(str){
    console.log("Responding to list checks for users: ", str);
}

// check details
cli.processInput.checkDetails = function(str){
    console.log("Responding to check details: ", str);

}

// List logs
cli.processInput.listLogs = function(){
    console.log("Responding to list logs");
}

// Log details
cli.processInput.logDetails = function(str){
    console.log("Responding to log details: ", str);
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
            'checks details',
            'list logs',
            'logs details'

        ];
        // Match the input to the uniquelist if matched ? emit a matched/found event
        var matched = false;
        var counter = 0;
        uniqueInputs.some((input) => {
            if(str.toLowerCase().includes(input)){
                matched = true;
                // Emit an event matching the unique input with the full string inputed by the user
                e.emit(input, str);
                return true;
            }
        });
        if(!matched) console.log("Sorry, try again");
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