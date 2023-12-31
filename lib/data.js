/**
* Library for storing, reading, deleting, and updating data a.k.a Data structure;
*
*/


// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Containier for the module (to be exported)
const lib = {};

// The base dir for the data
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = (dir, file, data, callback) => {
    // Open the fille for writing
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // Convert data to string
            const stringData = JSON.stringify(data);

            // Write to file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    // Close file
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {

                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }

                    });


                } else {
                    callback('Error writing to new file');
                }


            });
        } else {
            callback('Could"t create new file, file may already exist');
        }
    });
};

// Read data from file          
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8', (err, data) => {
        if(!err && data){
        callback(false, helpers.parseJsonToObj(data));
        } else {
            callback(err, data);
        }
        
    });
};

// Update data
lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {

        if (!err && fileDescriptor) {
            // Convert data to string 
            const stringData = JSON.stringify(data);
            // Truncate the file 
            fs.ftruncate(fileDescriptor, (err) => {
                if (!err) {
                    // Write and close file
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            // Close file
                            fs.close(fileDescriptor, err => {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing existing file');
                                }
                            });
                        } else {
                            callback('Error writing to existing file');
                        }
                    });
                } else {
                    callback('Error truncating fie');
                }
            });
        } else {
            callback('Could"t open the file for updating, it may not exist yet');
        }
    });
}

// Delete data from file
lib.delete = (dir, file, callback) => {
    fs.unlink(`${lib.baseDir}${dir}/${file}.json`, err => {
        if (!err) {
            // Remove the file
            callback(false);
        } else {
            callback(400, {error:"Error unlinking the file"});
        }
    });
}

// Read all data in a directory
    lib.listDir = function(dir, callback){
        fs.readdir(`${lib.baseDir}${dir}/`, (err, data) => {
            if(!err && data.length > 0){
                const trimmedFileNames = [];
                data.forEach((fileName) => {
                    trimmedFileNames.push(fileName.replace(/\.json/, ""));
                });
                callback(false, trimmedFileNames);

            } else {
                callback(err, data);
            } 

        });

    }


// Export the module 
module.exports = lib;
