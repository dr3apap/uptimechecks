
const _app = {}
_app.tests = {}
_app.tests.unit = require('./unit')

function printTestReport(success, limit, assertionFail) {

    console.log("");
    console.log('-------------BEGIN TEST REPORT -------------')
    var passPercentage = success / limit * 100;
    console.log("")
    console.log(`PASSED:${passPercentage.toFixed(1)}%`);
    console.log(`NUMBER PASSED: ${success}`);
    console.log("");
    console.log('-------------BEGIN ERROR DETAILS -------------')
    var fail = assertionFail.length;
    var failPercentage = fail / limit * 100;
    console.log(`FAILED: ${failPercentage.toFixed(1)}%`);
    console.log(`NUMBER FAILED: ${fail}`);
    for (const err of assertionFail) {
        console.log(err.name)
        console.log(err.error)
        console.log('-------------END ERROR DETAILS -------------')
    }

    console.log("");
    console.log('-------------END TEST REPORT -------------')
    console.log("");

}

_app.runTests = function() {
    const assertionFail = []
    let success = 0;
    let limit;
    let testCounter = 0;
    const tests = _app.tests;
    for (const unitTest in tests) {
        if (Object.hasOwn(tests, unitTest)) {
            const allUnitTest = tests[unitTest]
            if (!limit) limit = Object.keys(allUnitTest).length;
            for (const test in allUnitTest) {
                if (Object.hasOwn(allUnitTest, test)) {
                    try {
                        allUnitTest[test](function() {
                            console.log('\x1b[32m%s\x1b[0m', test)
                            testCounter++;
                            success++;
                            if (testCounter == limit) printTestReport(success, limit, assertionFail);
                        });
                    } catch (err) {
                        assertionFail.push({ name: test, error: err });
                        console.log('\x1b[31m%s\x1b[0m', test)
                        testCounter++;
                        if (testCounter == limit) printTestReport(success, limit, assertionFail);
                    }
                };
            };
        };
    };


};


_app.runTests();


