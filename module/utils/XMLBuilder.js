const Q = require('q');
const js2xml = require('js2xmlparser');
const moment = require('moment');
var config = require("../api/configuration.js").getConfiguration();
var constants = require('./constants.js');
const encryptor = require('../api/encryptor.js');
const signer = require('./signer.js');
const ErrorHandler = require('./errorHandler.js');
const apiUtils = require('./apiUtils.js');
//Function to get all values in an object
Object.values = Object.values || (obj => Object.keys(obj).map(key => obj[key]));
Object.isEmpty = Object.isEmpty || (obj => !(obj && Object.keys(obj).length > 0));

exports.buildAuthXML = function(personData) {
    
	let empty;

	//let TEST_PERSON = constants.TEST_DATA[2];
    let TEST_PERSON = personData;

    var needPi = apiUtils.needPi(personData), needPa = apiUtils.needPa(personData), needPfa = apiUtils.needPfa(personData), needBio = apiUtils.needBio(personData), needOTP = apiUtils.needOTP(personData), needPIN = apiUtils.needPIN(personData);
    if(needPa && needPfa) {
        throw new ErrorHandler('Both Pa and Pfa can\'t be used').setData(personData);
    }
	let uses = new Uses(Object.assign({ 
		pi: needPi ? constants.USES_PI.YES : constants.USES_PI.DEFAULT, 
		pa: needPa ? constants.USES_PA.YES  : constants.USES_PA.DEFAULT, 
		pfa: needPfa ? constants.USES_PFA.YES :constants.USES_PFA.DEFAULT, 
		bio: needBio ? constants.USES_BIO.YES : constants.USES_BIO.DEFAULT, 
		otp: needOTP ? constants.USES_OTP.YES : constants.USES_OTP.DEFAULT, 
		pin: needPIN ? constants.USES_PIN.YES  :constants.USES_PIN.DEFAULT 
	},
    needBio && {
        bt: apiUtils.getListOfBioMetrics(personData)
    }));
	let meta = new Meta({ udc: constants.META_UDC.DEFAULT });

	let ci = moment(encryptor.getExpiry(), constants.DATE_FORMAT_UNIX).format(constants.CERT_EXPRY_FORMAT);
	let sKey = encryptor.getSessionKey();
	let encrySKey = encryptor.encryptUsingPublicKey(sKey.toString('binary'));
	let encEncrySKey = encryptor.encode64(encrySKey);
	let skey = new Skey(encEncrySKey, { ci: ci });
    let pi, pa, pfa, bios, pv;
    if(needPi) {
	    pi = new Pi(Object.assign({ 
        ms: constants.PI_MATCHING_STGY.DEFAULT, 
        mv: constants.PI_MATCH_VALUE.DEFAULT,
        },
        personData.name && {name: personData.name}, 
        personData.gender && {gender: personData.gender}, 
        personData.dob && {dob: personData.dob}, 
        personData.dobt && {dobt: personData.dobt}, 
        personData.phone && {phone: personData.phone}, 
        personData.email && {email: personData.email} ));
    }
    if(needPa) {
    pa = new Pa(Object.assign({
        ms: constants.PA_MATCHING_STGY.DEFAULT
        }, 
        personData.street && {street: personData.street}, 
        personData.vtc && {vtc: personData.vtc}, 
        personData.subdist && {subdist: personData.subdist}, 
        personData.dist && {dist: personData.district}, 
        personData.state && {state: personData.state}, 
        personData.pc && {pc: personData.pincode}
    ));

    }


    if(needPfa) {
        pfa = new Pfa(Object.assign({
           ms: constants.PFA_MATCHING_STGY.DEFAULT,
           mv:constants.PFA_MATCHING_STGY.DEFAULT
        }, 
        personData.av && {av: personData.address} 
    ));

    }
	// let pa = new Pa({ms: PA_DEFAULT_MTCH_STGY, street: TEST_PERSON.street, vtc: TEST_PERSON.vtc, subdist: TEST_PERSON.subdist, dist: TEST_PERSON.district, state: TEST_PERSON.state, pc: TEST_PERSON.pincode})
    if(needBio) {
       bios = new Bios(empty, personData.bios) 
    }

    if(needOTP || needPIN) {
        pv = new Pv(Object.assign(
        personData.OTP && {otp : personData.OTP},
        personData.PIN && {pin : personData.PIN}
        ));
    }

	let demo = new Demo(pi, pa, pfa);

	let ts = moment().subtract(1, 'hour').format(constants.PID_TS_ISO8601);
    //console.log(config);
	let ver = constants.AADHAR_DATA[config.API_VERSION].PID_DEFAULT_VER;
	let pid = new Pid(demo, bios, pv, { ts: ts, ver: ver });

	let pidXml = js2xml.parse("ns2:Pid", pid/* , {declaration: {include: false}}*/);
	console.log("PID:\n" + pidXml)

	let encryPidXml = encryptor.encryptUsingSessionKey(pidXml, ts, sKey, true);
	let encEncryPidXml = encryptor.encode64(encryPidXml)
	let data = new Data(encEncryPidXml, { type: constants.DATA_TYPE.DEFAULT });

	let pidXmlHash = encryptor.generateSha256Hash(pidXml);
	let encryPidXmlHash = encryptor.encryptUsingSessionKey(pidXmlHash, ts, sKey);
	let encEncryPidXmlHash = encryptor.encode64(encryPidXmlHash);
	let hmac = new Hmac(encEncryPidXmlHash);

	let auth = new Auth(uses, meta, skey, data, hmac, { uid: TEST_PERSON.uid, rc: constants.AUTH_RC.DEFAULT, tid: constants.AUTH_TID.DEFAULT, ac: config.AUA_CODE, sa: config.SUB_AUA_CODE, ver: config.API_VERSION, txn: 'testTxn', lk: config.LICENSE_KEY });

	let authXml = js2xml.parse("Auth", auth/*, {declaration: {include: false}}*/);
	// console.log("AUTH: \n" + authXml);

	return signer.sign(authXml)
		.then(function (sign) {
			return Q.resolve(sign);
		});
}
let IS_UIDAI = false;

let pidXml;


function Auth(Uses, Meta, Skey, Data, Hmac, attrs) {
	this['@'] = Object.assign(
		{
			// xmlns: AUTH_XMLNS,
			uid: attrs.uid,
			tid: attrs.tid ? attrs.tid : constants.AUTH_TID.DEFAULT,
			ac: attrs.ac ? attrs.ac : config.AUA_CODE,
			sa: attrs.sa ? attrs.sa : config.SUB_AUA_CODE,
			ver: attrs.ver ? attrs.ver : config.API_VERSION,
			txn: attrs.txn,
			lk: attrs.lk ? attrs.lk : config.LICENSE_KEY
		},
		(config.API_VERSION == constants.API2_0) && { rc: attrs.rc ? attrs.rc : constants.AUTH_RC.DEFAULT }
	);
	this.Uses = Uses;
	this.Meta = Meta;
	this.Skey = Skey;
	this.Data = Data;
	this.Hmac = Hmac;
}

function Uses(attrs) {
	this['@'] = Object.assign(
		{
			pi: (Object.values(constants.USES_PI).indexOf(attrs.pi) > -1) ? attrs.pi : constants.USES_PI.DEFAULT,
			pa: (Object.values(constants.USES_PA).indexOf(attrs.pa) > -1) ? attrs.pa : constants.USES_PA.DEFAULT,
			pfa: (Object.values(constants.USES_PFA).indexOf(attrs.pfa) > -1) ? attrs.pfa : constants.USES_PFA.DEFAULT,
			bio: (Object.values(constants.USES_BIO).indexOf(attrs.bio) > -1) ? attrs.bio : constants.USES_BIO.DEFAULT,
			pin: (Object.values(constants.USES_PIN).indexOf(attrs.pin) > -1) ? attrs.pin : constants.USES_PIN.DEFAULT,
			otp: (Object.values(constants.USES_OTP).indexOf(attrs.otp) > -1) ? attrs.otp : constants.USES_OTP.DEFAULT
		},
		//TODO if make bt mandatory if bio = y 
		((attrs.bio === constants.USES_BIO.YES) && (Object.values(constants.USES_BT).indexOf(attrs.bt) > -1)) && { bt: attrs.bt }
	);
}

function Meta(attrs) {
	this['@'] = Object.assign(
		{ udc: attrs.udc ? attrs.udc :constants.META_UDC.DEFAULT },
		//TODO do bioauth check
		(config.API_VERSION == constants.API1_6) && {
			fdc: "NC",
			idc: "NA",
			lot: "P",
			lov: "560103",
			pip: "127.0.0.1"
		},
		(attrs.rdsId && attrs.rdsVer
			&& attrs.dpId && attrs.dc
			&& attrs.mi && attrs.mc) && {
			rdsId: attrs.rdsId,
			rdsVer: attrs.rdsVer,
			dpId: attrs.dpId,
			dc: attrs.dc,
			mi: attrs.mi,
			mc: attrs.mc
		}
	);
}

function Skey(encEncrySKey, attrs) {
	this['@'] = {
		ci: (moment(attrs.ci, constants.CERT_EXPRY_FORMAT, true).isValid()) ? attrs.ci : constants.TEST_CERT_CI()
	};
	this['#'] = encEncrySKey;
}

function Data(data, attrs) {
	this['@'] = {
		type: (Object.values(constants.DATA_TYPE).indexOf(attrs.type) > -1) ? attrs.type : constants.DATA_TYPE.DEFAULT
	};
	this['#'] = data;
}

function Hmac(hmac) {
	this['#'] = hmac;
}

function Pid(Demo, Bios, Pv, attrs) {
	this['@'] = Object.assign(
		{ "xmlns:ns2": constants.AADHAR_DATA[config.API_VERSION].PID_XMLNS },
		{
			ts: (moment(attrs.ts, constants.PID_TS_ISO8601, true).isValid()) ? attrs.ts : moment().format(constants.PID_TS_ISO8601),
			ver: attrs.ver ? attrs.ver : constants.PID_VER.DEFAULT
		},
		false && { wadh: attrs.wadh }
	);
	if (Demo || !Object.isEmpty(Demo)) { this.Demo = Demo }
	if (Bios || !Object.isEmpty(Bios)) { this.Bios = Bios }
	if (Pv || !Object.isEmpty(Pv)) { this.Pv = Pv }
}

function Demo(Pi, Pa, Pfa, attrs) {
	this['@'] = Object.assign(
		{},
		(attrs && Object.values(constants.LANGUAGE_CODE).indexOf(attrs.lang) > -1) && { lang: attrs.lang }
	);
	if (Pi || !Object.isEmpty(Pi)) { this.Pi = Pi }
	if (Pa || !Object.isEmpty(Pa)) { this.Pa = Pa }
	if (Pfa || !Object.isEmpty(Pfa)) { this.Pfa = Pfa }
}

function Pi(attrs) {
	this['@'] = Object.assign(
        {},
		(attrs.name) &&
		{
			ms: (Object.values(constants.PI_MATCHING_STGY).indexOf(attrs.ms) > -1) ? attrs.ms : constants.PI_MATCHING_STGY.DEFAULT,
			mv: (Object.values(constants.PI_MATCH_VALUE).indexOf(attrs.mv) > -1) ? attrs.mv : constants.PI_MATCH_VALUE.DEFAULT,
			name: attrs.name
		},
		//TODO add lang check
		(attrs.lname) && {
			lname: attrs.lname,
			lmv: (Object.values(constants.PI_LMATCH_VALUE).indexOf(attrs.lmv) > -1) ? attrs.lmv : constants.PI_LMATCH_VALUE.DEFAULT
		},
		(Object.values(constants.PI_GENDER).indexOf(attrs.gender) > -1) && { gender: attrs.gender },
		(moment(attrs.dob, constants.PI_DOB_FORMAT, true).isValid() || moment(attrs.dob, constants.PI_DOB_YEAR_FORMAT, true).isValid()) && { dob: attrs.dob },
		(Object.values(constants.PI_DOB_TYPE).indexOf(attrs.dobt) > -1) && { dobt: attrs.dobt },
		(attrs.age) && { age: attrs.age },
		(attrs.phone) && { phone: attrs.phone },
		(attrs.email) && { email: attrs.email }
	)
}

function Pa(attrs) {
	this['@'] = Object.assign(
		(attrs.co || attrs.house
			|| attrs.street || attrs.lm
			|| attrs.loc || attrs.vtc
			|| attrs.subdist || attrs.dist
			|| attrs.state || attrs.country
			|| attrs.pc || attrs.po)
		&& { ms: (Object.values(constants.PA_MATCHING_STGY).indexOf(attrs.ms) > -1) ? attrs.ms : constants.PA_MATCHING_STGY.DEFAULT },
		(attrs.co) && { co: attrs.co },
		(attrs.house) && { house: attrs.house },
		(attrs.street) && { street: attrs.street },
		(attrs.lm) && { lm: attrs.lm },
		(attrs.loc) && { loc: attrs.loc },
		(attrs.vtc) && { vtc: attrs.vtc },
		(attrs.subdist) && { subdist: attrs.subdist },
		(attrs.dist) && { dist: attrs.dist },
		(attrs.state) && { state: attrs.state },
		(attrs.country) && { country: attrs.country },
		(attrs.pc) && { pc: attrs.pc },
		(attrs.po) && { po: attrs.po }
	);
}

function Pfa(attrs) {
	this['@'] = Object.assign(
		(attrs.av) &&
		{
			ms: (Object.values(constants.PFA_MATCHING_STGY).indexOf(attrs.ms) > -1) ? attrs.ms : constants.PFA_MATCHING_STGY.DEFAULT,
			mv: (Object.values(constants.PFA_MATCH_VALUE).indexOf(attrs.mv) > -1) ? attrs.mv : constants.PFA_MATCH_VALUE.DEFAULT,
			av: attrs.av
		},
		//TODO add lang check
		(attrs.lav) && {
			lav: attrs.lav,
			lmv: (Object.values(constants.PFA_LMATCH_VALUE).indexOf(attrs.lmv) > -1) ? attrs.lmv : constants.PFA_LMATCH_VALUE.DEFAULT
		}
	)
}

function Bios(attrs, bioArray) {
	if (!bioArray || bioArray.length == 0) {
		return;
	}

	/*this['@'] = {
		dih: attrs.dih
	};*/
	this.Bio = [];

    for(var i = 0;i < bioArray.length; i++) {
        if(Object.values(constants.BIO_TYPE).indexOf(bioArray[i].type) < 0
		|| Object.values(constants.BIO_POSH).indexOf(bioArray[i].posh) < 0
		|| !bioArray[i].bs || bio[i].bio) {
            throw new ErrorHandler("Invalid Bio Element").setData(bioArray[i]);
        }
        this.Bio.push_back(
        {
		'@': {
			type: bioArray[i].type,
			posh: bioArray[i].posh,
			bs: bioArray[i].bs
		},
		'#': bioArray[i].bio
	    }
        )
    }
        
}

function Pv(attrs) {

	if ((IS_UIDAI && !attrs.otp && !attrs.pin) || (!IS_UIDAI && !attrs.otp)) { return; }
	this['@'] = Object.assign(
		{ otp: attrs.otp },
		IS_UIDAI && { pin: attrs.pin }
	)

}
