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
