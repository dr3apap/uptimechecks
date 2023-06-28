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

}


// Export the container/module
module.exports = cli;