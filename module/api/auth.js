const Q = require('q');
const conf = require('./configuration.js');
const constants = require('../utils/constants.js');
const ErrorHandler = require('../utils/errorHandler.js');
const ApiResponse = require('../utils/apiResponse.js');
const apiUtils = require('../utils/apiUtils.js');
const XMLBuilder = require('../utils/XMLBuilder.js');
var parseString = require('xml2js').parseString;
var https = require('http');

exports.authenticate = aadharAuthentication;

function aadharAuthentication(aadharNumber, data) {
    if(!aadharNumber) {
        return Q.reject(new ErrorHandler("Invalid Parameters"));
    }
    return XMLBuilder.buildAuthXML(data)
    .then(function(authXML){
        console.log("XML is "+authXML);
        return doRequest(aadharNumber, authXML, conf.getConfiguration());
    })
    .catch(function(error){
        //console.log(error);
        return Q.reject(error);
    });
}

function doRequest(uid, reqXml, config) {
	var options = {
		hostname: config.AADHAR_HOST,
		path: buildUrlPath(uid, constants.AADHAR_DATA[config.API_VERSION].URL_AUTH_PATHTEMPLATE, config),
		method: 'POST',
		headers: {
			'Content-Type': constants.CONTENT_TYPE,
			'Content-Length': Buffer.byteLength(reqXml),
			'REMOTE_ADDR': '127.0.1.1'
		}
	};
 
    var deferred = Q.defer();
	var req = https.request(options, function (res) {
		// console.log(res.statusCode);
		var buffer = '';
		res.on('data', function (data) {
			buffer = buffer + data;
			// console.log(buffer);
		});
		res.on('end', function () {
			console.log('\nResponse: ');
            //console.log(buffer);
            var response = new ApiResponse(buffer);
            return response.parseResponse()
                .then(function(parsedResponse){
                if(parsedResponse && parsedResponse.AuthRes.$.ret && parsedResponse.AuthRes.$.ret == 'y') {
                    return deferred.resolve(response);
                } else {
                    return deferred.reject(new ErrorHandler( apiUtils.errorMessages(response.AuthRes.$.err)).setData(response));
                    
                }
                    
                })
			//return deferred.resolve(buffer);
		});
	});

	req.on('error', function (err) {
		console.log(err);
        return deferred.reject(err);
	});

	//console.log('\nURL: ');
	//console.log(URL_HOST + buildUrlPath(uid, URL_PATHTEMPLATE));

	// reqXml = fs.readFileSync(require('path').join(__dirname, '..', '..', 'res', 'example_request_auth1_6.xml'),'utf8');
	//console.log('\nSending XML: ');
	//console.log(reqXml);
	req.write(reqXml);
	req.end();
    return deferred.promise;
}

function buildUrlPath(uid, pathTemplate, config) {
	let ver = config.API_VERSION;
	let ac = config.AUA_CODE;
	let uid0 = uid[0];
	let uid1 = uid[1];
	let asalk = config.LICENSE_KEY;

	let path = pathTemplate.replace('<ver>', ver)
		.replace('<ac>', ac)
		.replace('<uid[0]>', uid0)
		.replace('<uid[1]>', uid1)
		.replace('<asalk>', asalk)

	return path;
}
