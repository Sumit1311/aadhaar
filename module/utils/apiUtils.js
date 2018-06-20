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
       default :
            return 'Unknown error'
    }
}
