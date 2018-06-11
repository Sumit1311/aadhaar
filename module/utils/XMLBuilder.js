const Q = require('q');
const js2xml = require('js2xmlparser');
const moment = require('moment');
var config = require("../api/configuration.js").getConfiguration();
var constants = require('./constants.js');
const encryptor = require('../api/encryptor.js');
const signer = require('./signer.js');

exports.buildAuthXML = function(personData) {
    
	let empty;

	//let TEST_PERSON = constants.TEST_DATA[2];
    let TEST_PERSON = personData;

	let uses = new Uses({ pi: constants.USES_PI.DEFAULT, pa: constants.USES_PA.DEFAULT, pfa: constants.USES_PFA.DEFAULT, bio: constants.USES_BIO.DEFAULT, pin: constants.USES_PIN.DEFAULT, otp: constants.USES_OTP.DEFAULT });
	let meta = new Meta({ udc: constants.META_UDC.DEFAULT });

	let ci = moment(encryptor.getExpiry(), constants.DATE_FORMAT_UNIX).format(constants.CERT_EXPRY_FORMAT);
	let sKey = encryptor.getSessionKey();
	let encrySKey = encryptor.encryptUsingPublicKey(sKey.toString('binary'));
	let encEncrySKey = encryptor.encode64(encrySKey);
	let skey = new Skey(encEncrySKey, { ci: ci });


	let pi = new Pi({ ms: constants.PI_MATCHING_STGY.DEFAULT, mv: constants.PI_MATCH_VALUE.DEFAULT, name: TEST_PERSON.name/*, gender: TEST_PERSON.gender, dob: TEST_PERSON.dob, dobt: TEST_PERSON.dobt, phone: TEST_PERSON.phone, email: TEST_PERSON.email*/ });
	// let pa = new Pa({ms: PA_DEFAULT_MTCH_STGY, street: TEST_PERSON.street, vtc: TEST_PERSON.vtc, subdist: TEST_PERSON.subdist, dist: TEST_PERSON.district, state: TEST_PERSON.state, pc: TEST_PERSON.pincode})

	let demo = new Demo(pi);

	let ts = moment().subtract(1, 'hour').format(constants.PID_TS_ISO8601);
	let ver = constants.PID_VER.DEFAULT;
	let pid = new Pid(demo, empty, empty, { ts: ts, ver: ver });

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

function Bios(attrs, bio) {
	if (Object.values(constants.BIO_TYPE).indexOf(attrs.type) < 0
		|| Object.values(constants.BIO_POSH).indexOf(attrs.posh) < 0
		|| !attrs.bs || attrs.bio) {
		return;
	}

	this['@'] = {
		dih: attrs.dih
	};
	this.Bio = {
		'@': {
			type: attrs.type,
			posh: attrs.posh,
			bs: attrs.bs
		},
		'#': bio
	}
}

function Pv(attrs) {

	if ((IS_UIDAI && !attrs.otp && !attrs.pin) || (!IS_UIDAI && !attrs.otp)) { return; }
	this['@'] = Object.assign(
		{ otp: attrs.otp },
		IS_UIDAI && { pin: attrs.pin }
	)

}
