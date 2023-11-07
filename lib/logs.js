
/** 
 * Library for storing and rotating logs
 * 
*/


// Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const logLib = {};
logLib.baseDir = path.join(__dirname, '../.logs/');


logLib.append = (logFileName, logDatatoString, callback) => {
    fs.open(`${logLib.baseDir}${logFileName}.log`, 'a', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {

            fs.appendFile(fileDescriptor, `${logDatatoString}\n`, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback(`error:Couldn't close log file ${logFileName}`);
                        }
                    })
                } else {
                    callback(`error:Couldn't append log to logFile ${logFileName}`);
                }
            });
        } else {
            callback(`error:Couldn't open logFile ${logFileName} for appending log`);
        }
    });
};
logLib.listLogs = (includeCompressedLogs, callback) => {
    fs.readdir(logLib.baseDir, (err, logsData) => {
        if (!err && logsData.length > 0) {
            const trimmedLogFiles = [];
            logsData.forEach((log) => {
                if (log.includes(".log")) trimmedLogFiles.push(log.replace(/\.log/, ""));
                if (includeCompressedLogs && log.includes(".gz.b64")) trimmedLogFiles.push(log.replace(/\.gz.b64/, ""));
            });
            callback(false, trimmedLogFiles);
        } else {
            callback(err, logsData);
        }
    });
};
logLib.compresseLogs = (logId, newFileId, callback) => {
    fs.readFile(`${logLib.baseDir}${logId}.log`, 'utf8', (err, logData) => {
        if (!err && logData) {
            zlib.gzip(logData, (err, buffer) => {
                if (!err && buffer) {
                    fs.open(`${logLib.baseDir}${newFileId}.gz.b64`, "wx", (err, fileDescriptor) => {
                        if (!err && fileDescriptor) {
                            fs.writeFile(fileDescriptor, buffer.toString('base64'), (err) => {
                                if (!err) {
                                    fs.close(fileDescriptor, (err) => {
                                        if (!err) {
                                            callback(false);
                                        } else {
                                            callback(`error:Couldn't close ${newFileId}.gz.b64 after writing`)
                                        }
                                    });
                                } else {
                                    callback(`error:Couldn't write compress data to ${newFileId}.gz.b64`)
                                }

                            });
                        } else {
                            callback(`error:Couldn't open ${newFileId}.gz.b64 to write compress data`);
                        }
                    });
                } else {
                    callback(`error:Couldn't compress data read from ${logId}.log`);
                }
            });
        } else {
            callback(err, logData)
        }
    });
};

logLib.decompress = (fileId, callback) => {
    fs.readFile(`${logLib.baseDir}${fileId}.gz.b64`, 'utf8', (err, fileData) => {
        if (!err && fileData) {
            const inputBuffer = Buffer.from(fileData, "base64");
            zlib.unzip(inputBuffer, (err, outputBuffer) => {
                if (!err && outputBuffer) {
                    const fileDataToString = outputBuffer.toString();
                    callback(false, fileDataToString);
                } else {
                    callback(`error:Couldn't decompress ${fileId}gz.b64`);
                }

            });
        } else {
            callback(`error:Couldn't read ${fileId}.gz.b64 for decompression`);
        }

    });

};

logLib.truncate = (logId, callback) => {
    fs.truncate(`${logLib.baseDir}${logId}.log`, 0, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback(`error:Couldn't truncate ${logId}`);
        }
    });

};


module.exports = logLib;
