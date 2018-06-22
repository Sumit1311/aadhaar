const constants = require('./constants.js');

exports.needPi = function(personData) {
    if(personData.name || personData.lname || personData.lmv || personData.gender || personData.dob || personData.dobt || personData.age || personData.phone || personData.email) {
        return true;
    }
    return false;
}

exports.needPa = function(personData) {
    if(personData.co || personData.house || personData.street || personData.lm || personData.loc || personData.vtc || personData.subdist || personData.dist || personData.state || personData.pc || personData.po) {
        return true;
    }
    return false;
}

exports.needPfa = function(personData) {
    if(personData.address) {
        return true;
    }

    return false;
}

exports.needBio = function(personData) {
    if(personData.bios && personData.bios.length != 0) {
       return true; 
    }
    return false;
}

exports.needOTP = function(personData) {
    if(personData.OTP) {
        return true;
    }
    return false;
}

exports.needPIN = function(personData) {
    if(personData.PIN) {
        return true;
    }
    return false;
}

exports.getListOfBioMetrics = function(personData) {
   var bios = personData.bios;
   var list;
   var added = [0,0,0,0];
   for(var i = 0; i < bios.length; i++) {
	if(bios[i].bioType == constants.BIO_TYPE.FINGER_MINUTIAE && added[0] != 1) {
        if(list == undefined) {
            list = ""
        } else {
            list += ","
        }
		list += constants.BIO_TYPE.FINGER_MINUTIAE;
		added[0] = 1;
	}	
	else if(bios[i].bioType == constants.BIO_TYPE.FINGER_IMAGE && added[1] != 1) {
        if(list == undefined) {
            list = ""
        } else {
            list += ","
        }
		list += constants.BIO_TYPE.FINGER_IMAGE;
                added[1] = 1;
	}	
	else if(bios[i].bioType == constants.BIO_TYPE.IRIS_IMAGE && added[2] != 1) {
        if(list == undefined) {
            list = ""
        } else {
            list += ","
        }
		list += constants.BIO_TYPE.IRIS_IMAGE;
		added[2] = 1;
	}
	else if(bios[i].bioType == constants.BIO_TYPE.FACE_IMAGE_DATA && added[3] != 1) {
		list += constants.BIO_TYPE.FACE_IMAGE_DATA;
		added[3] = 1;
	}
    else {
        throw new Error("Unknown BIO TYPE need to be one of the defined");
    }
	if(added[0] && added[1] && added[2] && added[3]) {
		break;
	}	
   }
   return list;   
}
//Response Errors

exports.errorMessages = function(err) {
    switch(err) {
        case "100" : 
            return '“Pi” (basic) attributes of demographic data did not match.'
        case "200" : 
            return ' “Pa” (address) attributes of demographic data did not match.'
        case "300" : 
            return ' Biometric data did not match.';
        case "310" : 
            return 'Duplicate fingers used';
        case "311" :
            return "Duplicate Irises used.";
        case "312" :
            return "FMR and FIR cannot be used in same transaction";
        case "313" :
            return "Single FIR record contains more than one finger";
        case "314" :
            return "Number of FMR/FIR should not exceed 10";
        case "315" :
            return "Number of IIR should not exceed 2";
        case "400" : return "Invalid OTP value";
        case "401" : return "Invalid TKN value";
        case "500" : return "Invalid encryption of Skey";
        case "501" : return "Invalid certificate identifier in “ci” attribute of “Skey”";
        case "502" : return "Invalid encryption of Pid";
        case "503" : return "Invalid encryption of Hmac";
        case "504" : return "Session key re-initiation required due to expiry or key out of sync"
        case "505" : return "Synchronized Key usage not allowed for the AUA"
        case "510" : 
            return 'Invalid XML format';
        case "511" : return 'Invalid PID XML format';
        case "520" : return 'Invalid device';
        case "521" : return 'Invalid FDC code under Meta tag';
        case "522" : return 'Invalid IDC code under Meta tag';
        case "530" : return 'Invalid authenticator code';
        case "540" : return 'Invalid Auth XML version';
        case "541" : return 'Invalid PID XML version';
        case "542" : return 'AUA not authorized for ASA. This error will be returned if AUA and ASA do not have linking in the portal';
        case "543" : return 'Sub-AUA not associated with “AUA”. This error will be returned if Sub-AUA specified in “sa” attribute is not added as “Sub-AUA” in portal';
        case "550" : return 'Invalid “Uses” element attributes';
        case "551" : return 'Invalid “tid” value for registered device';
        case "552" : return 'Invalid registered device key, please reset';
        case "553" : return 'Invalid registered device HOTP, please reset';
        case "554" : return 'Invalid registered device encryption';
        case "555" : return 'Mandatory reset required for registered device';
        case "561" : return 'Request expired (“Pid->ts” value is older than N hours where N is a configured threshold in authentication server)';
        case "562" : return  'Timestamp value is future time (value specified “Pid->ts” is ahead of authentication server time beyond acceptable threshold)'
        case "563" : return  'Duplicate request (this error occurs when exactly same authentication request was re-sent by AUA)';
        case "564" : return 'HMAC Validation failed';
        case '565' : return  'AUA license has expired';
        case "566" : return 'Invalid non-decryptable license key';
        case "567" : return 'Invalid input (this error occurs when some unsupported characters were found in Indian language values, “lname” or “lav”)';
        case "568" : return 'Unsupported Language';
        case "569" :return 'Digital signature verification failed (means that authentication request XML was modified after it was signed)';
        case "570" : return  'Invalid key info in digital signature (this means that certificate used for signing the authentication request is not valid – it is either';
       default :
            return 'Unknown error'
    }
}

exports.parseInfoField =function(info) {
    var infoVersion = info.splice(0,2);  
    var fields = info.substring(4, info.length-1).split(',');
    console.log(fields);

    return  {
        version : infoVersion,
        encodedUsageData : parseInt(fields[2], 16)
    }
}
