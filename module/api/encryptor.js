const moment = require('moment');
const forge = require('node-forge');
const fs = require('fs');
const constants = require('../utils/constants.js');
const conf = require('./configuration.js');

let API_VERSION;
const DATE_FORMAT_ISO8601 = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]';
const DATE_FORMAT_UNIX = 'x';
const ALGO_AES_GCM = 'AES-GCM';
const ALGO_AES_ECB = 'AES-ECB';

let UIDAI_CERTIFICATE;

exports.init = function () {
	API_VERSION = conf.getConfiguration().API_VERSION;
	let pem = fs.readFileSync(conf.getConfiguration().UIDAI_CERT_PATH);
	UIDAI_CERTIFICATE = forge.pki.certificateFromPem(pem);
}

exports.getExpiry = function () {
	let expiry = UIDAI_CERTIFICATE.validity.notAfter;
	return moment(expiry, DATE_FORMAT_ISO8601).format(DATE_FORMAT_UNIX);
}

let keyCreated;
let keyId;
exports.getSessionKey = function () {
	//TODO finish this
	/* let now = moment();
	if(keyCreated === undefined || keyCreated.isBefore(now.subtract(10, 'minutes'))) {
		key = forge.random.getBytesSync(32);
		keyCreated = now;
		keyId = "1234"
	} */
	let key = forge.random.getBytesSync(32);
	// let key = crypto.randomBytes(32);
	return key;
}

exports.generateSha256Hash = function (data) {
	let hash = forge.md.sha256.create();
	hash.update(data);
	return hash.digest().getBytes();
}

exports.encryptUsingPublicKey = function (data) {
	let publicKey = UIDAI_CERTIFICATE.publicKey;
	//RSAES/PKCS1-V1_5
	let encrypted = publicKey.encrypt(data);
	return encrypted;
}

exports.encryptUsingSessionKey = function (data, ts, key, prependTs) {
	if (API_VERSION == constants.API_VERSION["2_0"]) {
		//AES-256/GCM
		let tsLast12Bytes = Buffer.from(ts).slice(-12);
		let tsLast16Bytes = Buffer.from(ts).slice(-16);

		let cipher = forge.cipher.createCipher(ALGO_AES_GCM, key);
		cipher.start({
			iv: tsLast12Bytes,
			additionalData: tsLast16Bytes
		});
		cipher.update(forge.util.createBuffer(data));
		cipher.finish();
		let encrypted = cipher.output;
		let tag = cipher.mode.tag;
		encrypted.putBytes(tag.getBytes());

		let encryptedBytes = encrypted.getBytes();
		if (prependTs) {
			let tsPrependedEncry = Buffer.concat([Buffer.from(ts), Buffer.from(encryptedBytes, 'binary')]);
			return tsPrependedEncry.toString('binary');
		}
		return encryptedBytes;
	} else if (API_VERSION == constants.API_VERSION["1_6"]) {
		//AES-256/ECB/PKCS7
		let cipher = forge.cipher.createCipher(ALGO_AES_ECB, key);
		cipher.start();
		cipher.update(forge.util.createBuffer(data));
		cipher.finish();
		let encrypted = cipher.output;
		return encrypted.getBytes();
	}
}

exports.encode64 = function (bytes) {
	return forge.util.encode64(bytes);
}

exports.test = function () {
	var data = 'abcde';
	var rsa = exports.encryptUsingPublicKey(data);
	var rsaEnc = exports.encode64(rsa);

	var sha = exports.generateSha256Hash(data);
	var shaEnc = exports.encode64(sha);


	console.log('RSA = \n' + rsaEnc);
	console.log('SHA = \n' + shaEnc);
}
