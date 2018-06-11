const encryptor = require('../api/encryptor.js');

exports.CONTENT_TYPE = 'application/xml';
exports.API2_0 = "2.0";
exports.API1_6 = "1.6";

exports.API_VERSION = {
    "2_0" : exports.API2_0,
    "1_6" : exports.API1_6
}

exports.AADHAR_DATA = {};
exports.AADHAR_DATA[exports.API2_0]  = {
    "AUTH_XMLNS" : "http://www.uidai.gov.in/authentication/uid-auth-request/2.0",
    "PID_XMLNS" : "http://www.uidai.gov.in/authentication/uid-auth-request-data/2.0",
    "AUTH_DEFAULT_TID" : "",
    "PID_DEFAULT_VER" : "2.0",
    "URL_AUTH_PATHTEMPLATE": '/auth/<ac>/<uid[0]>/<uid[1]>/<asalk>'//'<ver>/<ac>/<uid[0]>/<uid[1]>/<asalk>'
};
exports.AADHAR_DATA[exports.API1_6]  = {
    "AUTH_XMLNS" : "http://www.uidai.gov.in/authentication/uid-auth-request/1.6",
    "PID_XMLNS" : "http://www.uidai.gov.in/authentication/uid-auth-request-data/1.6",
    "AUTH_DEFAULT_TID" : "public",
    "PID_DEFAULT_VER" : "1.0", 
    "URL_AUTH_PATHTEMPLATE": '/<ver>/<ac>/<uid[0]>/<uid[1]>/<asalk>'
};

/* Format : <XML_TAG>_<ATTRIBUTE_NAME> */
//AUTH
exports.AUTH_RC = {YES : 'y', NO : 'n'};
exports.AUTH_RC.DEFAULT = exports.AUTH_RC.YES;
exports.AUTH_TID = {REGISTERED : "registered", EMPTY : ""};
exports.AUTH_TID.DEFAULT = exports.AUTH_TID.EMPTY;

//USES
exports.USES_PI = { YES: 'y', NO: 'n'}
exports.USES_PI.DEFAULT = exports.USES_PI.YES;
exports.USES_PA = { YES: 'y', NO: 'n'};
exports.USES_PA.DEFAULT = exports.USES_PA.NO;
exports.USES_PFA = { YES: 'y', NO: 'n'};
exports.USES_PFA.DEFAULT = exports.USES_PFA.NO;
exports.USES_BIO = { YES: 'y', NO: 'n'}; 
exports.USES_BIO.DEFAULT = exports.USES_BIO.NO;
exports.USES_BT = { FINGER_MINUTIAE: 'FMR', FINGER_IMAGE: 'FIR', IRIS_IMAGE: 'IIR', FACE_IMAGE_DATA: 'FID' };
exports.USES_PIN = { YES: 'y', NO: 'n', DEFAULT : this.NO };
exports.USES_PIN.DEFAULT = exports.USES_PIN.NO;
exports.USES_OTP = { YES: 'y', NO: 'n' , DEFAULT : this.NO };
exports.USES_OTP.DEFAULT = exports.USES_OTP.NO;

//META
exports.META_UDC = {SAMPLE : 'UIDAI:SampleClient'};
exports.META_UDC.DEFAULT = exports.META_UDC.SAMPLE;

//SKEY
exports.CERT_EXPRY_FORMAT = 'YYYYMMDD';
exports.TEST_CERT_CI = () => encryptor.getExpiry();
exports.DATE_FORMAT_UNIX = 'x';

//DATA
exports.DATA_TYPE = { XML: 'X', PROTOBUF: 'P' };
exports.DATA_TYPE.DEFAULT = exports.DATA_TYPE.XML;


//PID
exports.PID_TS_ISO8601 = 'YYYY-MM-DDThh:mm:ss';
//DEMO
exports.LANGUAGE_CODE = {
	Assamese: '01',
	Bengali: '02',
	Gujarati: '05',
	Hindi: '06',
	Kannada: '07',
	Malayalam: '11',
	Manipuri: '12',
	Marathi: '13',
	Oriya: '15',
	Punjabi: '16',
	Tamil: '20',
	Telugu: '21',
	Urdu: '22'
}
//PI
exports.PI_MATCHING_STGY = { EXACT: 'E', PARTIAL: 'P' };
exports.PI_MATCH_VALUE = [...Array(100).keys()].map(x => ++x);
exports.PI_LMATCH_VALUE = [...Array(100).keys()].map(x => ++x);
exports.PI_GENDER = {
	MALE: 'M',
	FEMALE: 'F',
	TRANSGENDER: 'T'
}
exports.PI_DOB_FORMAT = 'YYYY-MM-DD';
exports.PI_DOB_YEAR_FORMAT = 'YYYY';
exports.PI_DOB_TYPE = { VERIFIED: 'V', DECLARED: 'D', APPROXIMATE: 'A' };

exports.PI_MATCHING_STGY.DEFAULT = exports.PI_MATCHING_STGY.EXACT;
exports.PI_MATCH_VALUE.DEFAULT = 100;
//Not specified in specs
exports.PI_LMATCH_VALUE.DEFAULT = 100;
//PA
exports.PA_MATCHING_STGY = { EXACT: 'E' };
exports.PA_MATCHING_STGY.DEFAULT = exports.PA_MATCHING_STGY.EXACT;
//PFA
exports.PFA_MATCHING_STGY = { EXACT: 'E', PARTIAL: 'P' };
exports.PFA_MATCH_VALUE = [...Array(100).keys()].map(x => ++x);
exports.PFA_LMATCH_VALUE = [...Array(100).keys()].map(x => ++x);

exports.PFA_MATCHING_STGY.DEFAULT = exports.PFA_MATCHING_STGY.EXACT;
exports.PFA_MATCH_VALUE.DEFAULT = 100;
//Not specified in specs
exports.PFA_LMATCH_VALUE.DEFAULT = 100;
//BIO
exports.BIO_TYPE = { FINGER_MINUTIAE: 'FMR', FINGER_IMAGE: 'FIR', IRIS_IMAGE: 'IIR', FACE_IMAGE_DATA: 'FID' };
exports.BIO_POSH = {
	LEFT_IRIS: 'LEFT_IRIS',
	RIGHT_IRIS: 'RIGHT_IRIS',
	LEFT_INDEX: 'LEFT_INDEX',
	LEFT_LITTLE: 'LEFT_LITTLE',
	LEFT_MIDDLE: 'LEFT_MIDDLE',
	LEFT_RING: 'LEFT_RING',
	LEFT_THUMB: 'LEFT_THUMB',
	RIGHT_INDEX: 'RIGHT_INDEX',
	RIGHT_LITTLE: 'RIGHT_LITTLE',
	RIGHT_MIDDLE: 'RIGHT_MIDDLE',
	RIGHT_RING: 'RIGHT_RING',
	RIGHT_THUMB: 'RIGHT_THUMB',
	FACE: 'FACE',
	UNKNOWN: 'UNKNOWN'
};
//PV
