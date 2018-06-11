var conf = require('./api/configuration.js');
var encryptor = require('./api/encryptor.js');
var aadharApi = require('./api/auth.js');

exports.authenticate = aadharApi.authenticate;
exports.init = function() {
    return conf.init()
        .then(function(){
            return encryptor.init();
        })
}
