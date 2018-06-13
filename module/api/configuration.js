var Q = require('q');
var fs = require('fs');
var configuration = {};


exports.init = init;
exports.getConfiguration = getConfiguration;


function init() {
    var deferred = Q.defer();
    fs.readFile("../configuration.json", function(error, buffer){
        if(error) {
            deferred.reject(error);
            return;
        }
        configuration = JSON.parse(buffer);
        //console.log(configuration);
        deferred.resolve();
    })
    return deferred.promise;
}

function getConfiguration() {
    return configuration;
}
