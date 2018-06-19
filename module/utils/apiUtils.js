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
   var list = "";
   var added = [0,0,0,0];
   var isAdded = false;
   for(var i = 0; i < bios.length; i++) {
	if(bios[i].bioType == constants.BIO_TYPE.FINGER_MINUTIAE && added[0] != 1) {
		isAdded = true;
		list += constants.BIO_TYPE.FINGER_MINUTIAE;
		added[0] = 1;
	}	
	else if(bios[i].bioType == constants.BIO_TYPE.FINGER_IMAGE && added[1] != 1) {
		isAdded = true;
		list += constants.BIO_TYPE.FINGER_IMAGE;
                added[1] = 1;
	}	
	else if(bios[i].bioType == constants.BIO_TYPE.IRIS_IMAGE && added[2] != 1) {
		isAdded = true;
		list += constants.BIO_TYPE.IRIS_IMAGE;
		added[2] = 1;
	}
	else if(bios[i].bioType == constants.BIO_TYPE.FACE_IMAGE_DATA && added[3] != 1) {
		isAdded = true;
		list += constants.BIO_TYPE.FACE_IMAGE_DATA;
		added[3] = 1;
	}
        if(isAdded) {
		list += ",";
	}
	if(added[0] && added[1] && added[2] && added[3]) {
		break;
	}	
   }
   return list.split(0, list.length - 1);   
}
