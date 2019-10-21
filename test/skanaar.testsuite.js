// jshint quotmark: false
function TestSuite(suiteName) {
    function log(text) { console.log(text) }
    log.red = function (msg) { console.log('\x1b[31m%s\x1b[0m', msg) }
    var results = []
    var suite = {
        tests: {},
        test: function (name, test) {
            try {
                suite.tests[name] = test
                test()
                results.push({ name: name, status: 'success', error: false })
            }
            catch(e) {
                results.push({ name: name, status: 'failure', error: e })
            }
        },
        assertEqual: function (a, b) {
            if(!TestSuite.isEqual(a, b))
                throw new Error(JSON.stringify(a) + ' != ' + JSON.stringify(b))
        },
        ignore: {
            test: function (name) {
                results.push({ name: name, status: 'ignored', error: false })
            },
            assertEqual: function () {}
        },
        report: function () {
            if(typeof document == 'object') {
                var divs = results.map(function (e){
                    var rerunCallback = "TestSuite.run('"+suiteName+"','"+e.name+"')"
                    var div = '<div class='+e.status+' onclick="'+rerunCallback+'">'
                    var details = e.error ? '<div class=details>'+e.error+'</div>' : ''
                    return div + e.name + '</div>' + details
                })
                var h1 = '<h1>' + suiteName + '</h1>'
                document.getElementById('testreport').innerHTML = h1 + divs.join('')
            }
            else {
                var failures = results.filter(e => e.status == 'failure')
                failures.forEach(function (e){
                    log.red(e.name)
                    log('   ' + e.error)
                })
                if(failures.length)
                    throw new Error(failures.length + ' test failures')
            }
        }
    }
    TestSuite.suites = TestSuite.suites || {}
    TestSuite.suites[suiteName] = suite
    return suite
}

TestSuite.run = function (suite, test) {
    try { TestSuite.suites[suite].tests[test]() }
    catch(e) {}
}

TestSuite.isEqual = function (a, b) {
    switch (typeof(a)) {
        case 'undefined':
        case 'boolean':
        case 'number':
        case 'string':
        case 'symbol':
            return a === b
        case 'function':
            return typeof(a) === typeof(b)
        case 'object':
            if (a === null || b === null || b === undefined) {
                return a === b
            }
            for(var key in a) {
                if (a.hasOwnProperty(key)) {
                    if (!TestSuite.isEqual(a[key], b[key]))
                        return false
                }
            }
            for(var bKey in b) {
                if (b.hasOwnProperty(bKey)) {
                    if (!TestSuite.isEqual(a[bKey], b[bKey]))
                        return false
                }
            }
            return true
    }
}

module.exports = TestSuite