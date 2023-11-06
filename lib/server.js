/*   
 * Primary file for the API 
 *Server-related tasks
 *
 */

//Dependencies 
const http = require('http');
const https = require('https');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
require('dotenv').config();
const util = require('util');
const debug = util.debuglog('server');

const server = {};

// Https Server security keys
server.httpsServerOptions = {
    key: process.env.KEY_PEM,
    cert: process.env.CERT_PEM
}

// Http server
server.httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});


// Https Server
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});




// Configure enviroment for staging and production
const httpPort = parseInt(process.env.DEVELOPMENT_HTTP_PORT) || config.httpPort;
const httpsPort = parseInt(process.env.DEVELOPMENT_HTTPS_PORT) || config.httpsPort;



// Unified the Http and Https Server
const unifiedServer = (req, res) => {
    const parsedUrl = url.parse(req.url, true); // Get the URL and parse it 
    const path = parsedUrl.pathname; // Get the path from the URL 
    const trimmedPath = path.replace(/^\/+|\/+$/g, ''); // Trim the slashes off the path.  
    const queryStringObject = parsedUrl.query; // Get the query string as an object 
    const reqMethod = req.method.toLowerCase();
    const reqHeaders = req.headers;


    const decoder = new stringDecoder('utf-8');

    let buffer = ''; // Accumulate stream of data 


    req.on('data', data => {
        buffer += decoder.write(data);
    });



    req.on('end', () => {
        buffer += decoder.end();
        // Choose the handler to handle the request, if request is not found call
        // the notFound handler
        let chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;
        chosenHandler = trimmedPath.includes("public/") ? handlers.public : chosenHandler;

        // Construct the data object to send to the handler

        const data = {
            "trimmedPath": trimmedPath,
            "queryStringObject": queryStringObject,
            "method": reqMethod,
            "payload": helpers.parseJsonToObj(buffer),
            "headers": reqHeaders,
        };

        // Route the request to the handler specified in the router and handle any Error that may occur
        try {
            ;
            chosenHandler(data, (statusCode, payload, contentType) => {
                const reqObj = { res, trimmedPath, reqMethod, statusCode, payload, contentType };
                server.handleResponse(reqObj);
            });
        } catch (err) {
            //const statusCode = 500;
            //const payload = { 'Error': 'An unkown error has occured' };
            //const contentType = 'json';
            debug(err);
            const reqObj = { res, trimmedPath, reqMethod, statusCode: 500, payload: { 'Error': 'An unknown errror has occured', }, contentType: 'json' };
            server.handleResponse(reqObj);
        }
    });
};


// Proxy server to handle request response

server.handleResponse = function(reqObj) {
    const CT_DEFAULT = 'application/json';
    let { res, payload, contentType, statusCode, trimmedPath, reqMethod } = reqObj;
    // Determine the type of content response default to JSON
    const contentResponseList = ["html", "css", "json", "ico", "jpg", "png", "plain", "favicon"];
    const contentResponse = {
        html: "text/html",
        favicon: "image/x-icon",
        json: CT_DEFAULT,
        jpg: "image/jpeg",
        png: "image/png",
        css: "text/css"

    }
    const chosenContent = contentResponseList.includes(contentType) ? contentResponse[contentType] : CT_DEFAULT
    let payloadString = "";
    if (chosenContent == CT_DEFAULT) {
        // Use the payload called back by the handler, or default to empyty {}
        payload = typeof (payload) === 'object' ? payload : {};
        // Convert the payload to a string
        payloadString = JSON.stringify(payload);

    } else {
        //if (chosenContent && chosenContent !== CT_DEFAULT) {
        //}
        payloadString = typeof (payload) == 'string' ? payload : typeof (payload) !== null ? payload : "";

        // Use the status code called back by the handler, or default to 200
        statusCode = typeof (statusCode) === 'number' ? statusCode : 200;
    }


    // Return the response
    // if(token) res.setHeader('token', token); @TODO set token automatically when user logged in;
    res.setHeader('content-type', `${chosenContent}`);
    res.writeHead(statusCode);
    res.end(payloadString);
    // Print to terminal info about the request, 200 status green color else red color
    if (statusCode == 200) {
        debug('\x1b[32m%s\x1b[0m', `${reqMethod.toUpperCase()} ${trimmedPath} ${statusCode}`)
    } else {

        debug('\x1b[31m%s\x1b[0m', `${reqMethod.toUpperCase()} ${trimmedPath} ${statusCode}`)
    }



};

// Define  request router
server.router = {
    '': handlers.guiInterface,
    'user/create': handlers.guiInterface,
    'user/edit': handlers.guiInterface,
    'user/deleted': handlers.guiInterface,
    'session/create': handlers.guiInterface,
    'session/deleted': handlers.guiInterface,
    'checks/all': handlers.guiInterface,
    'checks/create': handlers.guiInterface,
    'checks/edit': handlers.guiInterface,
    'checks/deleted': handlers.guiInterface,
    'checks/delete-all': handlers.guiInterface,
    'ping': handlers.ping,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,
    'api/checks/all': handlers.checks,
    'favicon.ico': handlers.favicon,
    'public': handlers.public,
    'debug/error': handlers.handleError,


}


// Initializer for servers that get called from the index.js man app entry
server.init = function() {
    // Start the httpsServer
    server.httpsServer.listen(httpsPort, () => {
        console.log('\x1b[36m%s\x1b[0m', `Server is listening on https//:localhost:${httpsPort} in ${config.envName}
    mode`);
    });

    // Start the httpserver
    server.httpServer.listen(httpPort, () => {
        console.log('\x1b[35m%s\x1b[0m', `Server is listening on https//:localhost:${httpPort} in ${config.envName} mode`);
    });
}

module.exports = server;
