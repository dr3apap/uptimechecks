/**
 * Frontend Logic for the application 
 * 
 */

 
// container for the client/frontend app
const app = {};

app.config = {
    sessionToken:false,
}
app.init = function(){
   app.processFormRequest();
   app.getToken()
   app.getAllChecks();
   app.loadFormData();
   app.bindLogout();
}
window.onload = function(){
    app.init();
}



//General client side routine for fetching and storing data from the backend
app.client = {};
app.client.request = async function(reqObj, callback){
    const methods = ["GET", "POST", "DELETE", "PUT"];
    let {path, headers, method, queryStringObj, formPayload} = reqObj;
    path = typeof(path) == "string" && path.length > 0?path:'/';
    method = typeof(method) == "string" && methods.includes(method) ?method:"GET";
    headers = typeof(headers) == "object" && headers !== null?headers:{};
    queryStringObj = typeof(queryStringObj) == "object" && queryStringObj !== null?queryStringObj:{};
    formPayload = typeof(formPayload) == "object" && formPayload !== null? formPayload:{};
    
    callback =typeof(callback) == "function"? callback:false;
        // build the url
        let reqUrl = `${path}?`;
        let nextKey = 0;
        for(const queryKey in queryStringObj){
            if(queryStringObj.hasOwnProperty(queryKey)){
                nextKey++;
                if(nextKey > 1) `${reqUrl}&`;
                reqUrl = `${reqUrl}${queryKey}=${queryStringObj[queryKey]}`;
            }
        } 
        // Reconstruct the reqObj
        // Add content type and session token to header in case it's empty
        const reqHeaders = new Headers(headers);
        //reqHeaders.set("content-type", "application/json");

        // TODO: Read token from cookie or session
         if(app.config.sessionToken) reqHeaders.set("token", app.config.sessionToken.tokenId);
        const sanitizedReqObj = {
            method,
            headers:reqHeaders,
            cache:'default',
        }

        method !== "GET"?sanitizedReqObj.body = JSON.stringify(formPayload):sanitizedReqObj;
            //make the request and pass the callback for response if callback not false;
            //Check if callbck is false and handle it
            //fetch(reqUrl, sanitizedReqObj);
             if(callback) {
                const res = await fetch(reqUrl, sanitizedReqObj);
                const data = await res.json();
                callback(res.status, data)
             };
            
};
/** All edit/delete forms for users settings and checks  need to be popuplated with existing datas */
app.loadFormData = function(){
    const forms = document.querySelectorAll("form");
    if(forms.length > 1){
        let userPhone;
        let formChildren;
        switch(forms[0].id){
            case "user-edit1":
                userPhone = typeof (userPhone = app.config.sessionToken.phone) == "string"?userPhone:false;
                formChildren = Array.from(forms[0].elements);
                if(userPhone){
                    const reqObj = {
                        path:"/api/users", 
                        method:"GET", 
                        queryStringObj:{
                            phone:userPhone
                        },
                      
                    };
                    app.client.request(reqObj,(status, res) => {
                        if(status == 200){
                            formChildren.forEach((element) => {
                                if(element.type != "submit") element.value = res[element.name];
                            });
                        }
                        
                            });
                        } else {
                            console.log("Couldn't read user token");
                        };
                break;
            /* Only have access to the check id through qureryStringObj at the backend but the form ID will contain the 
            specific form id when the view template is render grab it from there it's needed to populated the view */ 
            case `checks-edit1-${forms[0].id.replace("checks-edit1-", "")}`:
                let id = forms[0].id.replace("checks-edit1-", "");
                if(id){
                    const reqObj = {
                        path:"/api/checks", 
                        method:"GET", 
                        queryStringObj:{
                            id:forms[0].id.replace("checks-edit1-", ""),
                        },
                       
                    };
                    app.client.request(reqObj,(status, res) => {
                        if(status == 200){
                            const { method, url, protocol, id, state } = res;
                            const checkRows = document.querySelector("#checkrows");
                            tr = checkRows.insertRow(-1);
                            tr.insertCell().textContent = id; 
                            tr.insertCell().textContent = method;
                            tr.insertCell().textContent = protocol;
                            tr.insertCell().textContent = url;
                            tr.insertCell().textContent = state;

                        }
                        
                            });
                        } else {
                            console.log("Unkown formId");
                        };
                break;
            default:
                console.log("Unknown form ID!");

        };

   };
};
app.processFormRequest = function(){
    let forms;
    if((forms = document.querySelectorAll("form"))){
    forms.forEach((form) => { 
        form.addEventListener("submit", function(e){
        e.preventDefault();
        const formId = this.id;
        const path  = this.action;
        const method = this.method.toUpperCase();
        const formChildren = Array.from(this.elements);
        //if(element.className == "error") element.style.display = "hidden";
        const formPayload = {};
        let generalError;
        formChildren.forEach((element) => {
         generalError = element.className == "error"? element:"";
            if(element.type !== "submit") var inputValue = element.type == "checkbox"?element.checked:element.value;
            // filter out the input with the name of successcodes and checked attributes
            if(typeof inputValue == "boolean" && element.name == "successCodes"){
                let elName = element.name;
                // We only initialize the payload with array of successcodes if we are here and it hasn't before;
                formPayload[elName] = typeof formPayload[elName] == "object" && formPayload[elName] instanceof Array?formPayload[elName]:[];
                // filter the value of only input with checked attribute and add them to successCodes
                if(inputValue) formPayload[elName].push(element.value);
            } else {
                if(element.name == "httpMethod") {
                    formPayload.method = inputValue;
                } else if(element.name == "timeout") {
                    formPayload[element.name] = parseInt(inputValue);
                } else {
                    //Any other input with type checked  or any other type is good to be added to payload;
                    formPayload[element.name] = inputValue;
                }
                 
            }
            // TODO:switch on each element name to display customize error message per each input
            // remove display message next run
            if(element.name == "tosAgreement" && !inputValue) {
               element.nextElementSibling.textContent = "You must agree to our tosAgreement"; 
            }
            
        });
        console.log("Current payloadf from formm input", formPayload); 
        app.client.request({path, method, formPayload}, (status, res) => {
           if(status == 201 || status == 200){
            app.processFormResponse(formId,formPayload, res);
           } else {
                generalError.textContent = res.error; 
           }
        });

    });
});
};

};


app.logUserOut = function(){
        let token    
        typeof (token = localStorage.getItem("token")) === "string"?token:false;
        if(token){
            const reqObj = {
                method:"DELETE",
                queryStringObj:{id:app.config.sessionToken.tokenId},
                path:"/api/tokens",
                // headers:{
                //     "token":app.config.sessionToken.tokenId
                // }
            }
        
            app.client.request(reqObj, (status, res) => {
                if(status == 201){
                    app.setToken(false);
                    window.location = "/"; // @TODO:A logout page with a cta to login back
                } else {
                    console.log("Sorry something happened we could not log you out!");
                }

                });
            } else {
                console.log("You're never logged in!");
            }

};
app.bindLogout = function(){
    const logout = document.querySelector("#logout");
    if(logout){
        logout.addEventListener("click", function(e){
            e.preventDefault();
            app.logUserOut();
        });
    }
};

app.setToken = function(token){
    // Set the token object in the app config
    // The token will bre read from there for authentication but stored in localStorage
    app.config.sessionToken = token;
    var tokenString = JSON.stringify(token);
    localStorage.setItem("token", tokenString);
    if(typeof (token) == "object"){
        app.setLoggedIn(true);        
    } else {
        app.setLoggedIn(false);
    }
};  


// Get the token from localStorage and put it in the app config object
// All auth route will be reading the token from the app config;
app.getToken = function(){
    var tokenString = localStorage.getItem("token");
    if(typeof(tokenString) == "string"){
    try{
        let token = JSON.parse(tokenString);
        app.config.sessionToken = token;
        if(typeof(token) == "object"){
            app.setLoggedIn(true);
        } else {
            app.setLoggedIn(false);
        }
    } catch(e){
            app.config.sessionToken = false;
            app.setLoggedIn(false);
        }
    }
};

app.setLoggedIn = function(add){
const ul =  document.querySelector(".nav__menus");
    if(add){
        ul.classList.add("loggedin");   
        ul.classList.remove("loggedout");
} else {
    ul.classList.remove("loggedin")
    ul.classList.add("loggedout");
}

};

app.getAllChecks = () => {
    let checkRows;
    let checkRowsLength;
    checkRowsLength = document.querySelector(".checkslength");
    let checksLimit = document.querySelector("[colspan='5']");
    checkRows = document.querySelector("#checkrows");
    if(checkRows && checkRowsLength){
            const reqObj = {
                method:"GET",
                path:"/api/checks/all"
            }
            app.client.request(reqObj, (status, checksList) =>{
                if(status == 200){
                checkRowsLength.textContent = checksList.length;
                checksLimit.style.setProperty("--checks-length", checksList.length);
                    if(checksList.length == 5){
                        checksLimit.innerHTML = "You have reached Your Maximum Checks Limit!"
                        document.querySelector("#checkrows__add").classList.add("hide");
                    };
                    if(checksList.length > 0){
                        for(let i = 0; i<checksList.length; i++){
                            const tr = checkRows.insertRow(-1);
                            const { protocol, method, url, state, id } = checksList[i];
                            tr.insertCell().textContent = method.toUpperCase();
                            tr.insertCell().textContent = `${protocol}://`; 
                            tr.insertCell().textContent = url;
                            tr.insertCell().textContent = state;
                            tr.insertCell().innerHTML = `<a href="checks/edit?id=${id}">View/Delete/Edit</a>`;
                            };
                           
                   };

                } else {
                    console.log("Something went wrong: couldn't fetch checks")
                };
            });
        };
};




app.processFormResponse = function(formId, formPayload, resPayload){
    //Process all the reponse that came from processFromRequest input, redirect users and perform all the view/delete/edit
    switch(formId){
        case "usercreate":
            // Log user in and get token for protected routes
            const tokenPayload = {
                formPayload:{
                    phone:formPayload.phone,
                    password:formPayload.password
                },
                method:"POST",
                path:"/api/tokens"
            };
            // Make the token request and store it in local storage 
            app.client.request(tokenPayload, (status, newResPayload) => {
                if(status == 201 || status == 200){
                    app.setToken(newResPayload);
                    // Redirect the user to their specific dashboard page
                    window.location = "/checks/all";
                    
                    
                } else {
               //@TODO:formated the error display to user;
                    console.log("Please login/create account, your session may have expire", newResPayload);
                }
                //@TODO: Add the tokens to the configuration object
            });
            break;

        case "sessioncreate":
            // Should only be here if user coming from sessioncreate and was successful
            //Store the token that user got form login for subsequent protected routes
                app.setToken(resPayload);
                window.location = "/checks/all"; 
            break;

        case "user-edit3":
            // Since user account is deleted route them to logout
            app.logUserOut();
            break;
        case "checkscreate":
            // Show user the checks that was just created
            window.location = "/checks/all";
            break;

        default:
            console.log("Unkown formId!");

                };
};

