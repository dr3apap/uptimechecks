const assert = require('assert')

const logs = require('./../lib/logs')

const handlers = require('./../lib/handlers')
const helpers = require('./../lib/helpers')

const unit = {};

unit['helpers.returnNumber should return 1'] = function(done) {

    const val = helpers.returnNumber();
    assert.equal(val, 1);
    done();
}


unit['helpers.returnNumber should return number'] = function(done) {
    const val = helpers.returnNumber();
    assert.equal(typeof (val), 'number');
    done();
}
unit['helpers.returnNumber should return 2'] = function(done) {
    const val = helpers.returnNumber();
    assert.equal(val, 2);
    done();
}


unit['logs.list callback no error and and an Arrray of logFiles'] = function(done) {
    logs.listLogs(true, function(err, logFileNames) {
        assert.equal(err, false);
        assert.ok(logFileNames instanceof Array)
        assert.ok(logFileNames.length > 1)
        done();
    });
};


unit['logs.truncate does not throw if logId does not exist but call back an error'] = function(done) {
    assert.doesNotThrow(function() {
        logs.truncate('Hey! no id', function(err) {
            assert.ok(err);
            done();
        })
    }, TypeError);
};

unit['logs.handleError throw error when responding to debug/error path'] = function(done) {

    assert.doesNotThrow(function() {
        handlers.handleError();
        done();
    }, TypeError);
};

module.exports = unit;
