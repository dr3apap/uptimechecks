/**
 * Entry point for the API 
 */


// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

// App name space 
const app = {};

// App Init function
app.init = function(){
// Server Start/Init
server.init();
// Workers Start/Init
workers.init();

/* Start the CLI, but start it last so that the console doesn't get clogged by outputs we want to be able to
 see the output of the servers starting and the workers too.*/
setTimeout(function(){
    cli.init();
},50);
};

// Call/Execute
app.init();

// Export the app
module.exports = app;
