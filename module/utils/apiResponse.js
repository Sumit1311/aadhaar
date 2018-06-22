var parseString = require('xml2js').parseString;
var Q =require('q');
const apiUtils = require('./apiUtils.js');

module.exports = class apiResponse {
    constructor(a) {
        this.actualResponse = a;
        return this; 
    }
    getParseResponse() {
        var deferred = Q.defer(); 
        var self = this;
        if(this.parsedResponse == undefined) {
            parseString(this.actualResponse, function(err,result) {
                if(err) {
                    return deferred.reject(err);
                }
                //console.log("======");
                //console.log((result));
                self.parsedResponse = result;
                return deferred.resolve(self.parsedResponse);
            })
        } else {
            return this.parsedResponse;
        }
    }
    getInfoField() {
        return apiUtils.parseInfoField(this.getParseResponse().AuthRes.$.info);
    }
}
