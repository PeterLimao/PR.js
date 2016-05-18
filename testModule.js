PR.define('testModule', ['testModule2', 'testModule3'], function(testModule2, testModule3) {
    var testModule = {};
    testModule.names = [
        testModule2.name,
        testModule3.name
    ]
    return testModule;
});
