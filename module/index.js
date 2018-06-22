var conf = require('./api/configuration.js');
var encryptor, aadharApi;
var Q = require('q');

exports.init = function() {
    return conf.init()
        .then(function(){
            return require('./utils/signer.js').init(conf.getConfiguration());
        })
        .then(function(){
            encryptor = require('./api/encryptor.js');
            return encryptor.init();
        })
        .then(function(){
            aadharApi = require('./api/auth.js');
            exports.authenticate = aadharApi.authenticate;
            exports.constants = require('./util/costants.js');
        })
        .catch(function(error){
            return Q.reject(error);
        })
}
