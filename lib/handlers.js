/**
 *  Define the primary request handlers
 **/

//TODO:seprate dellAll and deleByID, getCheck and getall into there seprate handlers, Have a hanldler for changing usersphone and make it propagate to all resources holding by the user.Make sure user can't access any resources if token is expire the need to request fresh token

// Dependencies 
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');
const path = require('path');

const handlers = {};


// Route handler
handlers.ping = function (data, callback) {
    // Ping the server to see if it's still alive. 
    callback(200);
}
handlers.notFound = function (data, callback) {
    // Send an statudCode not found request if url did not match any route.
    callback(404);
}

handlers.favicon = function (data, callback) {
    if (data.method == "get") {
        helpers.getStaticAssets("favicon.ico", (err, faviconData) => {
            if (!err && faviconData) {
                callback(200, faviconData, "favicon")
            } else {
                callback(500, undefined, "html");
            }
        })
    } else {
        callback(405, undefined, "html");
    }

};

handlers.public = function (data, callback) {
    if (data.method == "get") {
        const requestedAsset = data.trimmedPath.replace(/public\//, "").trim();
        if (requestedAsset.length > 0) {
            helpers.getStaticAssets(requestedAsset, (err, data) => {
                if (!err && data) {
                    let contentType = "plain";
                    if (requestedAsset.includes(".css")) contentType = "css";
                    if (requestedAsset.includes(".png")) contentType = "png";
                    if (requestedAsset.includes(".jpg")) contentType = "jpg";
                    if (requestedAsset.includes(".ico")) contentType = "favicon";
                    callback(200, data, contentType);
                } else {
                    callback(404)
                }
            });
        } else {
            callback(404)
        }
    } else {
        callback(405);
    }
}

/**
 * HTML Handlers
 * 
 * 
 */

handlers.guiInterface = function (data, callback) {

        let reqPath; 
    switch (data.trimmedPath) {
        case "":
            reqPath = "index";
            handlers._guiInterface[reqPath](reqPath, data, callback);
            break;
        case "user/create": {
            reqPath = "userCreate";
            handlers._guiInterface[reqPath](reqPath, data, callback);
            break;
        };
        case "user/edit": {
            reqPath = "userEdit";
            handlers._guiInterface[reqPath](reqPath, data, callback);
            break;
        };
        case "user/deleted": {
            reqPath = "userDeleted"
            handlers._guiInterface[reqPath](reqPath, data, callback);
            break;
        };
        case "session/create": {
            reqPath = "sessionCreate";
            handlers._guiInterface[reqPath] (reqPath, data, callback);
            break;
        };
        case "session/deleted": {
            reqPath = "sessionDeleted";
            handlers._guiInterface[reqPath](reqPath, data, callback);
            break;
        };
        case "checks/all":
            reqPath = "checksAll";
            handlers._guiInterface[reqPath](reqPath, data, callback);
            break;

        case "checks/create":
            reqPath = "checksCreate";
            handlers._guiInterface[reqPath](reqPath, data, callback);
            break;
        case "checks/edit":
            reqPath = "checksEdit";
            handlers._guiInterface[reqPath](reqPath, data, callback);
            break;

        default:
            callback("error:Unkown Path", undefined, "html");
    };

};

handlers._guiInterface = {

    _template(reqPath, templateData, callback) {
        helpers.getTemplate(reqPath, templateData, (err, template, contentType) => {
            if (!err && template) {
                helpers.addUniversalTemplate(template, templateData, (err, finalTemplate) => {
                    if (!err && finalTemplate) {
                        callback(200, finalTemplate, contentType);

                    } else {
                        callback(500, undefined, contentType)
                    }

                });

            } else {
                callback(500, undefined, contentType);
            }
        });

    },

    index(reqPath, data, callback) {
        if (data.method == 'get') {

            const templateData = {
                "head.title": "Uptime Check -Made simple with rapid response",
                "head.description": "We offer free, simple uptime checks/monitoring for any kind of webstie/webserver/api for HTTP/HTTPS response via text messages",
                "body.class": "index",
            };

            this._template(reqPath, templateData, callback);

        } else {
            callback(405, undefined, "html");
        }

    },


    userCreate(reqPath, data, callback) {
        if (data.method == 'get') {

            const templateData = {
                "head.title": "Create an Account!",
                "head.description": "Sign up is easy and only takes few seconds",
                "form.id": "usercreate",
                "body.class": "usercreate"
            };

            this._template(reqPath, templateData, callback);


        } else {
            callback(405, undefined, "html");
        }

    },

    checksAll(reqPath, data, callback) {
                const templateData = {
                "head.title": "Sage dashboard",
                "body.class": "checksall",

            };
        
        if (data.method == 'get') {
            this._template(reqPath, templateData, callback);
        } else {
            callback(405, undefined,"html");
        }
          
            
    },




    userDeleted(reqPath, data, callback) {
        if (data.method == 'get') {

            const templateData = {
                "head.title": "Delete your account",
                "head.description": "Your account has been deleted",
                "body.class": "userdeleted"
            };

            this._template(reqPath, templateData, callback);


        } else {
            callback(405, undefined, "html");
        }

    },

    userEdit(reqPath, data, callback) {
          if (data.method == 'get') {

            const templateData = {
                "head.title": "Edit Your Settings!",
                "form.id": "useredit",
                "body.class": "useredit"
            };

            this._template(reqPath, templateData, callback);


        } else {
            callback(405, undefined, "html");
        }

    },

    sessionCreate(reqPath, data, callback) {
        if (data.method == 'get') {
            const templateData = {
                "head.title": "Account Login",
                "head.description": "Please Login to your account",
                "form.id": "sessioncreate",
                "body.class": "sessioncreate"
            };

            this._template(reqPath, templateData, callback);


        } else {
            callback(405, undefined, "html");
        }

    },

    checksCreate(reqPath, data, callback) {
        if (data.method == 'get') {
            const templateData = {
                "head.title": "Create a check",
                "form.id": "checkscreate",
                "body.class": "checkscreate"
            };

            this._template(reqPath, templateData, callback);


        } else {
            callback(405, undefined, "html");
        }

    },
    checksEdit(reqPath, data, callback) {
        if (data.method == 'get') {
            const templateData = {
                "head.title": "Edit Check",
                "form.id": `checks-edit1-${data.queryStringObject.id}`,
                "form.id2":`checks-edit2-${data.queryStringObject.id}`,
                "check.id":`${data.queryStringObject.id}`
            };

            this._template(reqPath, templateData, callback);


        } else {
            callback(405, undefined, "html");
        }

    },
    

};






/**
 *JSON API Handlers 
 *  
*/


//Users
handlers.users = function (data, callback) {
    const allowedMethods = ["get", "post", "delete", "put"];
    if (allowedMethods.includes(data.method)) {
        handlers._users[data.method](data, callback);
    } else {

        callback(405);
    }

};
//Users Handlers
handlers._users = {

    // Users post
    post(data, callback) {
        let firstName = data.payload.firstName;
        let phone = data.payload.phone;
        let lastName = data.payload.lastName;
        let password = data.payload.password;
        let tosAgreement = data.payload.tosAgreement;
        firstName = typeof (firstName) == 'string' && firstName.trim().length > 0 ? firstName.trim() : false;
        phone = typeof (phone) == 'string' && phone.trim().length == 10 ? phone : false;
        lastName = typeof (lastName) == 'string' && lastName.trim().length > 0 ? lastName.trim() : false;
        password = typeof (password) == 'string' && password.trim().length > 0 ? password.trim() : false;
        tosAgreement = typeof (tosAgreement) == 'boolean' && tosAgreement == true ? tosAgreement : false;
        if (firstName && phone && lastName && password && tosAgreement) {
            // Make sure that the user doesn't already exist
            _data.read("users", phone, (err, data) => {
                if (err) {
                    const hashedPassword = helpers.hash(password);
                    if (hashedPassword) {
                        const user = {
                            firstName: firstName,
                            lastName: lastName,
                            phone: phone,
                            hashedPassword: hashedPassword,
                            tosAgreement: tosAgreement
                        };

                        _data.create('users', phone, user, (err) => {
                            if (!err) {
                                callback(201);
                            } else {
                                callback(500, { error: "Sorry could not create new user" });
                            }
                        });
                    } else {
                        callback(500, { error: "Could not hash the user's password" });
                    }

                } else {
                    callback(400, { error: "A user with that phone number already exists" });
                }
            });


        } else {
            callback(400, { error: "Missing required fields" })
        }


    },

    // Users delete
    delete(data, callback) {
        let phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
        if (phone) {
            const tokenId = typeof (data.headers.token) == "string" && data.headers.token.trim().length == 20 ? data.headers.token : false;
            handlers._tokens.validateUser(tokenId, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    _data.read("users", phone, (err, userData) => {
                        if (!err && userData) {
                            if (userData.checks.length > 0) {
                                const allChecks = [...userData.checks];
                                for (i = 0; i < allChecks.length; i++) {
                                    _data.delete("checks", allChecks[i], (err) => {
                                        if (!err) {
                                        } else {
                                            callback(500, { error: "Can't delete specified user, please check your info!" });
                                        }

                                    });
                                }

                                _data.delete("users", phone, (err) => {
                                    if (!err) {
                                        callback(200);
                                    } else {
                                        callback(500, { error: "Can't delete specified user, please check your info!" });
                                    }

                                });
                            } else {
                                _data.delete("users", phone, (err) => {
                                    if (!err) {
                                        callback(200);
                                    } else {
                                        callback(500, { error: "Can't delete specified user, please check your info!" });
                                    }

                                });
                            }


                        } else {
                            callback(404, { error: "User not found!" });

                        }
                    });
                } else {
                    callback(403, { error: "Missing required token in header, or token is invalid" });
                }
            })

        } else {
            callback(400, { error: "Missing required field" });
        }

    },

    // Users put
    put(data, callback) {
        let phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
        //let password = data.payload.password;
        if (phone) {
            const tokenId = typeof (data.headers.token) == "string" && data.headers.token.trim().length == 20 ? data.headers.token : false;
            handlers._tokens.validateUser(tokenId, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    let firstName = data.payload.firstName;
                    let lastName = data.payload.lastName;
                    let password = data.payload.password;
                    firstName = typeof (firstName) == 'string' && firstName.trim().length > 0 ? firstName.trim() : false;
                    lastName = typeof (lastName) == 'string' && lastName.trim().length > 0 ? lastName.trim() : false;
                    password = typeof (password) == 'string' && password.trim().length > 0 ? password.trim() : false;
                    _data.read("users", phone, (err, userData) => {
                        if (!err && data)
                            if (firstName || lastName || password) {
                                userData.firstName = firstName;
                                userData.lastName = lastName;
                                userData.hashedPassword = helpers.hash(password);
                                _data.update("users", phone, userData, (err) => {
                                    if (!err) {
                                        callback(200);
                                    } else {
                                        callback(400, { error: "Could not update the user" })
                                    }
                                })
                            } else {
                                callback(400, { error: "Misssing fields to update" });
                            }


                        else {
                            callback(404, { error: "User not found" });
                        }

                    });
                } else {
                    callback(403, { error: "Missing required token in header, or token is invalid" });
                }
            })

        } else {
            callback(400, { error: "Missing require fields!" });
        }

    },

    // Users get
    get(data, callback) {
        let phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
        if (phone) {
            const tokenId = typeof (data.headers.token) == "string" && data.headers.token.trim().length == 20 ? data.headers.token : false;
            handlers._tokens.validateUser(tokenId, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    _data.read("users", phone, (err, data) => {
                        if (!err && data) {
                            delete data.hashedPassword;
                            callback(200, data);

                        } else {
                            callback(404, { error: "User not found!" })

                        }
                    });
                } else {
                    callback(403, { error: "Missing required token in header, or token is invalid" })
                }
            })
            //let password = data.payload.password;

        } else {
            callback(400, { error: "Missing required field" });
        }
    }

};





//Tokens
handlers.tokens = function (data, callback) {
    const allowedMethods = ["get", "post", "put", "delete"];
    if (allowedMethods.includes(data.method)) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};
//Tokens Handlers
handlers._tokens = {
    post(data, callback) {
        let phone = data.payload.phone;
        let password = data.payload.password;
        phone = typeof (phone) == "string" && phone.trim().length == 10 ? phone : false;
        password = typeof (password) == "string" && password.trim().length > 0 ? password : false;
        if (phone && password) {
            _data.read("users", phone, (err, userData) => {
                if (!err && userData) {
                    const hashedPassword = helpers.hash(password);
                    if (userData.hashedPassword == hashedPassword) {
                        const tokenObj = {
                            tokenId: helpers.randomStr(20),
                            tokenExp: Date.now() + 1000 * 60 * 60,
                            "phone": phone,

                        };
                        _data.create("tokens", tokenObj.tokenId, tokenObj, (err) => {
                            if (!err) {
                                callback(201, tokenObj);

                            } else {
                                callback(500, { error: "Couldn't create token!" })
                            }
                        });

                    } else {
                        callback(400, { error: "Incorrect password" });
                    }
                } else {
                    callback(404, { error: "User not found!" })
                }
            })
        } else {
            callback(400, { Errror: "Missing required fields" });
        }

    },
    get(data, callback) {
        let tokenId = typeof (data.queryStringObject.tokenId) == 'string' && data.queryStringObject.tokenId.trim().length == 20 ? data.queryStringObject.tokenId.trim() : false;
        if (tokenId) {
            //let password = data.payload.password;
            _data.read("tokens", tokenId, (err, tokenData) => {
                if (!err && tokenData) {
                    callback(200, tokenData);

                } else {
                    callback(404, { error: "User not found!" })

                }
            });
        } else {
            callback(400, { Erro: "Missing required field" });
        }

    },
    put(data, callback) {
        let phone = data.payload.phone;
        let tokenId = data.payload.tokenId;
        let extend = data.payload.extend;
        phone = typeof (phone) == "string" && phone.trim().length == 10 ? phone : false;
        tokenId = typeof (tokenId) == 'string' && tokenId.trim().length == 20 ? tokenId.trim() : false;
        extend = typeof (extend) == 'boolean' && extend == true ? extend : false;

        if (phone && tokenId && extend) {
            _data.read("tokens", tokenId, (err, tokenData) => {
                if (!err && tokenData) {
                    if (tokenData.tokenExp > Date.now()) {
                        tokenData.tokenExp = Date.now() + 1000 * 60 * 60;
                        _data.update("tokens", tokenId, tokenData, (err) => {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, { error: "Couldn't update token's expiration" });
                            }

                        });
                    } else {
                        callback(400, { error: "Token already expired, and cannot be extended" });
                    }
                } else {
                    callback(404, { error: "Specified token does not exist" })
                }

            });
        } else {
            callback(400, { error: "Missing required field(s) or field(s) are invalid!" });
        }

    },
    delete(data, callback) {
        //    let phone = data.payload.phone;
        //    let password = data.payload.password;
        let tokenId = data.queryStringObject.id
        //     phone = typeof(phone) == "string" && phone.trim().length == 10?phone:false;
        //     password = typeof(password) == "string" && password.trim().length > 0?password:false;
        tokenId = typeof (tokenId) == 'string' && tokenId.trim().length == 20 ? tokenId.trim() : false;
        if (tokenId) {
            _data.read("tokens", tokenId, (err, tokenData) => {
                if (!err && tokenData) {
                    _data.delete("tokens", tokenId, (err) => {
                        if (!err) {
                            callback(201);
                        } else {
                            callback(500, { error: "Couldn't delete tokens" });
                        }
                    })
                } else {
                    callback(404, { error: "User not found" })
                }

            });
        } else {
            callback(400, { error: "Missing require fields!" });
        }

    },
    validateUser(tokenId, phone, callback) {
        _data.read("tokens", tokenId, (err, tokenData) => {
            if (!err && tokenData) {
                if (tokenData.phone == phone) {
                    callback(true)
                } else {
                    callback(false);
                }
            } else {
                callback(false);
            }
        })

    }


};





//Checks
handlers.checks = function (data, callback) {
    const allowedMethods = ["get", "post", "delete", "put"];
    if (allowedMethods.includes(data.method)) {
        handlers._checks[data.method](data, callback);
    } else {

        callback(405);
    }

};






//Checks Handlers
handlers._checks = {
    post(data, callback) {
        let protocol = data.payload.protocol;
        let url = data.payload.url;
        let method = data.payload.method;
        let successCodes = data.payload.successCodes;
        let timeout = data.payload.timeout;
        protocol = typeof (protocol) == "string" && ["https", "http"].indexOf(protocol) > -1 ? protocol : false;
        url = typeof (url) == "string" && url.trim().length > 0 ? url : false;
        method = typeof (method) == "string" && ["get", "post", "put", "delete"].includes(method) ? method : false;
        successCodes = typeof (successCodes) == "object" && successCodes instanceof Array && successCodes.length > 0 ? successCodes : false
        timeout = typeof (timeout) == "number" && timeout % 1 === 0 && timeout >= 1 <= 5 ? timeout : false;
        if (protocol && url && method && successCodes && timeout) {
            let tokenId;
            typeof (tokenId = data.headers.token) == "string" && tokenId.length == 20 ? tokenId : false;
            _data.read("tokens", tokenId, (err, tokenData) => {
                if (!err && tokenData) {
                    let userPhone = tokenData.phone;
                    _data.read("users", userPhone, (err, userData) => {
                        if (!err && userData) {
                            const userChecks = typeof (userData.checks) == "object" && userData.checks instanceof Array ? userData.checks : [];
                            if (userChecks.length < config.maxChecks) {
                                const checkId = helpers.randomStr(20);
                                const checkObj = {
                                    id: checkId,
                                    phone: userPhone,
                                    state:"unknown",
                                    protocol,
                                    url,
                                    method,
                                    successCodes,
                                    timeout,
                                };
                                _data.create("checks", checkId, checkObj, (err) => {
                                    if (!err) {
                                        userData.checks = userChecks;
                                        userData.checks.push(checkId);
                                        _data.update("users", userPhone, userData, (err) => {
                                            if (!err) {
                                                callback(200, checkObj);
                                            } else {
                                                callback(500, { error: "Couldn't update Users with the new checks!" })
                                            }
                                        })
                                    } else {
                                        callback(500, { error: "Couldn't create new check!" })
                                    }


                                });
                            } else {
                                callback(400, { error: `Maximum checks limit reached (${config.maxChecks})` });
                            }



                        } else {
                            callback(403, { error: "User not found!" })
                        }

                    });

                } else {
                    callback(403, { error: "Specified token in header is not valid" })
                }
            });



        } else {
            callback(403, { error: "Missing required token in header or token is invalid" })
        }
    },

    get(data, callback) {
        const checkId = data.queryStringObject?.id;
        const checksAllPath = data.trimmedPath;
        if (checkId) {
            getCheckById(data, callback);
        } else {
            if (checksAllPath.includes("all")) {
            getChecksAll(data, callback);

            }
        }

        function getChecksAll(data, callback) {
            const tokenId = typeof (data.headers.token) == "string" && data.headers.token.trim().length == 20 ? data.headers.token : false;
            if (tokenId) {
                _data.read("tokens", tokenId, (err, tokenData) => {
                    if (!err && tokenData) {
                        const userPhone = tokenData.phone;
                        _data.read("users", userPhone, (err, userData) => {
                            if (!err && userData) {
                                if(userData.checks && userData.checks.length > 0) {
                                    const checksList = [...userData.checks];
                                    const allChecks = [];
                                for (i = 0; i < checksList.length; i++) {
                                    _data.read("checks", checksList[i], (err, checkData) => {
                                        if (!err && checkData) {

                                            allChecks.push(checkData);
                                            if (allChecks.length == checksList.length) {
                                                callback(200, allChecks);
                                            }
                                        } else {
                                            callback(403);
                                        }
                                    });

                                }
                            } else {
                                callback(200, []);
                            }
                            } else {
                                callback(403);
                            }
                        })
                    } else {
                        callback(403);
                    }
                })
            } else {
                callback(403, { error: "Missing required token in header or token is invalid" });
            }
        };


        function getCheckById(data, callback) {
            let checkId = data.queryStringObject.id;
            let tokenId = data.headers.token;
            checkId = typeof (checkId) == "string" && checkId.trim().length == 20 ? checkId : false;
            tokenId = typeof (tokenId) == "string" && tokenId.trim().length == 20 ? tokenId : false;

            if (checkId && tokenId) {
                _data.read("checks", checkId, (err, checkData) => {
                    if (!err && checkData) {
                        handlers._tokens.validateUser(tokenId, checkData.phone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                callback(200, checkData);
                            } else {
                                callback(403);
                            }

                        });

                    } else {
                        callback(403, { error: `Couldn't find check with ${checkId}` });
                    }
                });

            } else {
                callback(403, { error: "Missing required token in header, token or checkId is invalid" });
            }
        };
    },
    put(data, callback) {
        let checksId = data.queryStringObject.id;
        checksId = typeof (checksId) == "string" && checksId.trim().length == 20 ? checksId : false;
        let tokenId = data.headers.token;
        if (checksId) {
            _data.read("checks", checksId, (err, checksData) => {
                if (!err && checksData) {
                    tokenId = typeof (tokenId) == "string" && tokenId.trim().length == 20 ? tokenId : false;
                    const userPhone = checksData.phone;
                    handlers._tokens.validateUser(tokenId, userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            let protocol = data.payload.protocol;
                            let url = data.payload.url;
                            let method = data.payload.method;
                            let successCodes = data.payload.successCodes;
                            let timeout = data.payload.timeout;
                            protocol = typeof (protocol) == "string" && ["https", "http"].indexOf(protocol) > -1 ? protocol : false;
                            url = typeof (url) == "string" && url.trim().length > 0 ? url : false;
                            method = typeof (method) == "string" && ["get", "post", "put", "delete"].indexOf(method) > -1 ? method : false;
                            successCodes = typeof (successCodes) == "object" && successCodes instanceof Array && successCodes.length > 0 ? successCodes : false
                            timeout = typeof (timeout) == "number" && timeout % 1 === 0 && timeout >= 1 <= 5 ? timeout : false;
                            if (protocol || url || method || successCodes || timeout) {
                                if (protocol) checksData.protocol = protocol;
                                if (url) checksData.url = url;
                                if (method) checksData.method = method;
                                if (successCodes) checksData.successCodes = successCodes;
                                if (timeout) checksData.timeout = timeout;
                                _data.update("checks", checksId, checksData, (err) => {
                                    if (!err) {
                                        callback(200);
                                    } else {
                                        callback(403, { error: `Couldn't update checks for id ${checksId}` });
                                    }
                                });
                            } else {
                                callback(404, { error: "Missing required field(s)" })
                            }


                        } else {
                            callback(403);
                        }
                    });

                } else {
                    1
                    callback(403, { error: `Check id ${checksId} does not exist!` });
                }
            });
        } else {
            callback(400, { error: "Missing required field" });
        }


    },
    delete(data, callback) {
        let checksId = data.queryStringObject.id;
        checksId ? deleteById(data, callback) : deleteChecksAll(data, callback);
        function deleteById(data, callback) {
            //let checkId = data.queryStringObject.id;
            let tokenId = data.headers.token;
            checksId = typeof (checksId) == "string" && checksId.trim().length == 20 ? checksId : false;
            tokenId = typeof (tokenId) == "string" && tokenId.trim().length == 20 ? tokenId : false;
            if (tokenId && checksId) {
                _data.read("checks", checksId, (err, checksData) => {
                    if (!err && checksData) {
                        const userPhone = checksData.phone;
                        handlers._tokens.validateUser(tokenId, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                _data.read("users", userPhone, (err, userData) => {
                                    if (!err && userData) {
                                        const userChecks = typeof (userData.checks) == "object" && userData.checks instanceof Array ? userData.checks : [];
                                        _data.delete("checks", checksId, (err) => {
                                            if (!err) {
                                                const checkIndex = userChecks.indexOf(checksId);
                                                if (checkIndex > -1) {
                                                    userChecks.splice(checkIndex, 1);
                                                } else {
                                                    callback(500, { error: "Couldn't find check" });
                                                }
                                                _data.update("users", userPhone, userData, (err) => {
                                                    if (!err) {
                                                        callback(200);
                                                    } else {
                                                        callback(500, { error: `Couldn't delete check ${checksId}` });
                                                    }
                                                })
                                            } else {
                                                callback(500, { error: `Couldn't delete check ${checksId}` });
                                            }
                                        });
                                    } else {
                                        callback(404, { error: "Couldn't find user" })
                                    }

                                });
                            } else {
                                callback(403);
                            }
                        })

                    } else {
                        callback(400, { error: "Missing required token in headers or token, checksId is invalid" });
                    }
                });

            } else {
                callback(404, { error: "Missing required field(s)" })
            }
        };
        function deleteChecksAll(data, callback) {
            //let checkId = data.queryStringObject.id;
            let tokenId = data.headers.token;
            //checksId = typeof(checksId) == "string" && checksId.trim().length == 20?checksId:false;
            tokenId = typeof (tokenId) == "string" && tokenId.trim().length == 20 ? tokenId : false;
            if (tokenId) {
                _data.read("tokens", tokenId, (err, tokenData) => {
                    if (!err && tokenData) {

                        const userPhone = tokenData.phone;
                        _data.read("users", userPhone, (err, userData) => {
                            if (!err && userData) {
                                const userChecks = typeof (userData.checks) == "object" && userData.checks instanceof Array ? userData.checks : [];
                                if (userChecks.length > 0) {
                                    const checksList = [...userData.checks];
                                    for (i = 0; i < checksList.length; i++) {
                                        _data.delete("checks", checksList[i], (err) => {
                                            if (!err) {
                                                // const checkIndex = userData.checks.indexOf(checksList[i]);
                                                // userData.checks.splice(checkIndex, 1);

                                            } else {
                                                callback(500, { error: `Couldn't delete check ${checksList[i]}` });
                                            }
                                        });

                                    }
                                    userData.checks = [];
                                    _data.update("users", userPhone, userData, (err) => {
                                        if (!err) {
                                            callback(200);
                                        } else {
                                            callback(500, { error: `Couldn't update user ${userPhone}` });
                                        }
                                    });

                                } else {
                                    callback(500, { error: "Couldn't find any checks for user" })
                                }

                            } else {
                                callback(404, { error: "Couldn't find user" })
                            }

                        });
                    } else {
                        callback(400, { error: "Missing required token in headers or token, checksId is invalid" });
                    }
                });

            } else {
                callback(404, { error: "Missing required field(s)" })
            }
        };

    }
}


module.exports = handlers;